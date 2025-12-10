console.log('Script starting...');

let map, directionsService, directionsRenderer, geocoder;
let googleMapsLoaded = false;
let currentPubs = [];
let currentRouteData = null;
let apiKey = '';

function initializeGoogleMaps() {
    try {
        geocoder = new google.maps.Geocoder();
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#4285f4',
                strokeWeight: 5
            }
        });
        console.log('Google Maps services initialized');
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// ===== LOCATION FEATURE =====
async function useCurrentLocation() {
    const btn = document.getElementById('use-location-btn');
    const input = document.getElementById('location-input');
    const status = document.getElementById('location-status');
    
    if (!navigator.geolocation) {
        showLocationStatus('error', 'Geolocation is not supported by your browser');
        return;
    }
    
    btn.classList.add('loading');
    btn.disabled = true;
    showLocationStatus('loading', 'Getting your location...');
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
        
        const { latitude, longitude } = position.coords;
        console.log('Got user location:', latitude, longitude);
        
        showLocationStatus('loading', 'Finding your address...');
        const address = await reverseGeocode(latitude, longitude);
        
        input.value = address;
        
        btn.classList.remove('loading');
        btn.classList.add('success');
        showLocationStatus('success', `Location set: ${address}`);
        
        setTimeout(() => {
            btn.classList.remove('success');
            btn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Location error:', error);
        
        btn.classList.remove('loading');
        btn.classList.add('error');
        btn.disabled = false;
        
        let errorMessage = 'Unable to get your location';
        
        if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please check your device settings.';
        } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showLocationStatus('error', errorMessage);
        
        setTimeout(() => {
            btn.classList.remove('error');
        }, 3000);
    }
}

async function reverseGeocode(lat, lng) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        
        const response = await fetch('https://pub-crawler-backend.vercel.app/api/reverse-geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ lat, lng })
        });
        
        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            for (const result of data.results) {
                if (result.types.includes('locality') || 
                    result.types.includes('sublocality') ||
                    result.types.includes('neighborhood')) {
                    return result.formatted_address;
                }
            }
            return data.results[0].formatted_address;
        } else {
            throw new Error('No address found for this location');
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Unable to determine address from coordinates');
    }
}

function showLocationStatus(type, message) {
    const status = document.getElementById('location-status');
    status.className = `location-status ${type}`;
    status.textContent = message;
    
    if (type === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
}
// ===== END LOCATION FEATURE =====

async function searchPubs(location, numPubs, historicFilter, maxDistance, minRating, openNow, startingRadius) {
    showLoading();
    
    try {
        const center = await geocodeLocation(location);
        console.log('Center coordinates:', center);
        
        const startRadius = parseInt(startingRadius) || 1000;
        console.log(`Starting radius: ${(startRadius / 1000).toFixed(1)}km from location`);
        
        let searchRadius = 1000;
        const maxSearchRadius = maxDistance * 2;
        
        console.log(`\n=== Searching for ${numPubs} pubs within ${(maxDistance / 1000).toFixed(1)}km total walking distance ===`);
        
        const pubs = await findPubs(center, searchRadius, historicFilter);
        console.log(`Found ${pubs.length} pubs`);
        
        const filteredPubs = filterPubs(pubs, historicFilter, minRating, openNow);
        console.log(`After filtering: ${filteredPubs.length} pubs`);
        
        if (filteredPubs.length === 0) {
            const filterType = historicFilter === 'all' ? 'pubs' :
                             historicFilter === 'sports' ? 'sports bars' : 
                             historicFilter === 'outdoor' ? 'pubs with outdoor seating' :
                             historicFilter === 'afternoontea' ? 'venues serving afternoon tea' :
                             historicFilter === 'happyhour' ? 'venues with happy hour' :
                             historicFilter === 'priority' ? 'historic pubs' :
                             'pubs';
            showError(`No ${filterType} found in this area. Try a different location or adjust your filters.`);
            return;
        }
        
        const pubsWithinStartRadius = filteredPubs.filter(pub => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(center.lat, center.lng),
                pub.geometry.location
            );
            return distance <= startRadius;
        });
        
        console.log(`Pubs within ${(startRadius / 1000).toFixed(1)}km of location: ${pubsWithinStartRadius.length}`);
        
        if (pubsWithinStartRadius.length === 0) {
            const filterType = historicFilter === 'all' ? 'pubs' :
                             historicFilter === 'sports' ? 'sports bars' : 
                             historicFilter === 'outdoor' ? 'pubs with outdoor seating' :
                             historicFilter === 'afternoontea' ? 'venues serving afternoon tea' :
                             historicFilter === 'happyhour' ? 'venues with happy hour' :
                             historicFilter === 'priority' ? 'historic pubs' :
                             'pubs';
            showError(`No ${filterType} found within ${(startRadius / 1000).toFixed(1)}km of your location. Try increasing the starting distance or choosing a different location.`);
            return;
        }
        
        const sortedPubs = selectBestPubs(pubsWithinStartRadius, pubsWithinStartRadius.length, center, maxDistance);
        console.log(`Available pubs: ${sortedPubs.length}`);
        
        let bestRoute = null;
        let bestRouteDistance = Infinity;
        let bestRoutePubs = null;
        
        const requestedNum = parseInt(numPubs);
        const maxPubsToTry = Math.min(requestedNum, sortedPubs.length);
        
        for (let numToTry = maxPubsToTry; numToTry >= 2; numToTry--) {
            console.log(`\n--- Trying ${numToTry} pubs ---`);
            
            const candidatePubs = sortedPubs.slice(0, numToTry);
            const optimized = optimizeRoute(candidatePubs, center);
            const directionsResult = await calculateDirections(optimized);
            
            if (directionsResult && directionsResult.routes && directionsResult.routes[0]) {
                const routeDistance = directionsResult.routes[0].legs.reduce(
                    (sum, leg) => sum + leg.distance.value, 
                    0
                );
                
                console.log(`${numToTry} pubs: Route distance = ${(routeDistance / 1000).toFixed(2)}km (max: ${(maxDistance / 1000).toFixed(2)}km)`);
                
                if (routeDistance < bestRouteDistance) {
                    bestRouteDistance = routeDistance;
                    bestRoutePubs = optimized;
                    bestRoute = directionsResult;
                }
                
                if (routeDistance <= maxDistance) {
                    console.log(`✓ Success! Found route with ${numToTry} pubs within ${(maxDistance / 1000).toFixed(2)}km`);
                    currentRouteData = directionsResult;
                    
                    if (numToTry < requestedNum) {
                        window.insufficientPubs = {
                            found: numToTry,
                            requested: requestedNum,
                            reason: 'distance'
                        };
                    } else {
                        window.insufficientPubs = null;
                    }
                    
                    displayResults(optimized);
                    return;
                }
            }
        }
        
        console.log(`\n⚠ Could not create route within ${(maxDistance / 1000).toFixed(2)}km`);
        console.log(`Best route found: ${bestRoutePubs.length} pubs, ${(bestRouteDistance / 1000).toFixed(2)}km`);
        
        if (bestRoutePubs && bestRoutePubs.length >= 2) {
            window.insufficientPubs = {
                found: bestRoutePubs.length,
                requested: requestedNum,
                reason: 'distance',
                actualDistance: bestRouteDistance,
                maxDistance: maxDistance
            };
            
            currentRouteData = bestRoute;
            displayResults(bestRoutePubs);
        } else {
            showError(`Could not create a walking route in this area. Try increasing the maximum walking distance or choosing a different location.`);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Search failed: ' + error.message);
    }
}

async function geocodeLocation(location) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        
        const response = await fetch('https://pub-crawler-backend.vercel.app/api/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ address: location })
        });
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            const coords = { lat: loc.lat, lng: loc.lng };
            console.log('Geocoded location:', location, '→', coords);
            return coords;
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

async function findPubs(center, maxDistance, historicFilter) {
    console.log('Searching for pubs around:', center, 'within', maxDistance, 'meters');
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        
        let textQuery = 'pub';
        if (historicFilter === 'sports') {
            textQuery = 'sports bar OR pub';
        } else if (historicFilter === 'afternoontea') {
            textQuery = 'afternoon tea OR tea room OR cafe';
        } else if (historicFilter === 'happyhour') {
            textQuery = 'bar OR pub';
        } else if (historicFilter === 'outdoor') {
            textQuery = 'pub OR bar';
        } else if (historicFilter === 'priority') {
            textQuery = 'historic pub OR traditional pub';
        }
        
        console.log('Searching for:', textQuery);
        
        const response = await fetch('https://pub-crawler-backend.vercel.app/api/search-places', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                location: `${center.lat},${center.lng}`,
                radius: maxDistance,
                type: 'pub',
                keyword: textQuery
            })
        });
        
        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Backend returned:', data.places?.length || 0, 'results');
        
        if (!data.places || data.places.length === 0) {
            console.warn('No places returned');
            return [];
        }
        
        const converted = data.places.map(place => {
            const lat = place.location?.latitude || 0;
            const lng = place.location?.longitude || 0;
            
            return {
                place_id: place.id,
                name: place.displayName?.text || 'Unknown',
                vicinity: place.formattedAddress || '',
                rating: place.rating || 0,
                user_ratings_total: place.userRatingCount || 0,
                types: place.types || [],
                geometry: {
                    location: new google.maps.LatLng(lat, lng)
                },
                opening_hours: null,
                today_hours: null,
                editorial_summary: place.editorialSummary?.text || '',
                ai_summary: '',
                goodForWatchingSports: false,
                outdoorSeating: false,
                servesAfternoonTea: false
            };
        });
        
        return converted;
        
    } catch (error) {
        console.error('Search error:', error);
        throw new Error('Failed to search for pubs: ' + error.message);
    }
}

function filterPubs(pubs, historicFilter, minRating, openNow) {
    const historicKeywords = ['historic', 'old', 'traditional', 'victorian', 'heritage', 
                             'ancient', 'ye olde', 'coaching', 'inn', 'tavern',
                             'edwardian', 'tudor', 'medieval', 'georgian', 'stuart', 'roman'];
    
    const sportsKeywords = ['sports', 'sport', 'game', 'games', 'screen', 'screens', 'tv', 'televisions'];
    
    const outdoorKeywords = ['beer garden', 'garden', 'outdoor seating', 'patio', 'terrace', 'outdoor', 'al fresco', 'outside'];
    
    const afternoonTeaKeywords = ['afternoon tea', 'high tea', 'tea service', 'tea room', 'tea house', 'scones', 'tea cakes', 'tiered tea', 'cream tea'];
    
    const happyHourKeywords = ['happy hour', 'happy hr', 'drink specials', 'drink deals', '2 for 1', 'two for one', 'discounted drinks', 'half price', 'cheap drinks', 'cocktail hour', 'early bird'];
    
    console.log('Filtering', pubs.length, 'pubs with filter:', historicFilter, 'minRating:', minRating, 'openNow:', openNow);
    
    const filtered = pubs.filter(pub => {
        if (pub.rating && pub.rating < minRating) {
            console.log('Filtered out by rating:', pub.name, pub.rating);
            return false;
        }
        
        if (openNow === true || openNow === 'true') {
            if (!pub.opening_hours || !pub.opening_hours.open_now) {
                console.log('Filtered out by opening hours:', pub.name);
                return false;
            }
        }
        
        if (historicFilter === 'afternoontea') {
            const name = pub.name.toLowerCase();
            const summary = (pub.editorial_summary || '').toLowerCase();
            const aiSummary = (pub.ai_summary || '').toLowerCase();
            const combined = name + ' ' + summary + ' ' + aiSummary;
            
            const isTeaVenue = pub.types.includes('tea_house') || 
                              pub.types.includes('cafe') || 
                              pub.types.includes('restaurant') || 
                              pub.types.includes('hotel');
            
            const hasAfternoonTeaKeyword = afternoonTeaKeywords.some(keyword => combined.includes(keyword));
            const servesAfternoonTea = pub.servesAfternoonTea === true;
            
            if (!isTeaVenue || (!servesAfternoonTea && !hasAfternoonTeaKeyword)) {
                console.log('Filtered out (no afternoon tea):', pub.name);
                return false;
            }
        }
        
        if (historicFilter === 'happyhour') {
            const name = pub.name.toLowerCase();
            const summary = (pub.editorial_summary || '').toLowerCase();
            const aiSummary = (pub.ai_summary || '').toLowerCase();
            const combined = name + ' ' + summary + ' ' + aiSummary;
            
            const isBarVenue = pub.types.includes('bar') || 
                              pub.types.includes('pub') || 
                              pub.types.includes('night_club');
            
            const hasHappyHourKeyword = happyHourKeywords.some(keyword => combined.includes(keyword));
            
            if (!isBarVenue || !hasHappyHourKeyword) {
                console.log('Filtered out (no happy hour):', pub.name);
                return false;
            }
        }
        
        if (historicFilter === 'outdoor') {
            const name = pub.name.toLowerCase();
            const summary = (pub.editorial_summary || '').toLowerCase();
            const aiSummary = (pub.ai_summary || '').toLowerCase();
            const combined = name + ' ' + summary + ' ' + aiSummary;
            
            const hasOutdoorKeyword = outdoorKeywords.some(keyword => combined.includes(keyword));
            const hasOutdoorSeating = pub.outdoorSeating === true;
            
            if (!hasOutdoorSeating && !hasOutdoorKeyword) {
                console.log('Filtered out (no outdoor seating):', pub.name);
                return false;
            }
        }
        
        if (historicFilter === 'sports') {
            const name = pub.name.toLowerCase();
            const summary = (pub.editorial_summary || '').toLowerCase();
            const aiSummary = (pub.ai_summary || '').toLowerCase();
            const combined = name + ' ' + summary + ' ' + aiSummary;
            
            const excludedTypes = ['movie_theater'];
            const hasExcludedType = excludedTypes.some(type => pub.types.includes(type));
            const hasCinemaInSummary = combined.includes('cinema');
            
            if (hasExcludedType || hasCinemaInSummary) {
                console.log('Filtered out (excluded venue type):', pub.name);
                return false;
            }
            
            const isBarType = pub.types.includes('bar') || pub.types.includes('pub');
            const hasSportsKeyword = sportsKeywords.some(keyword => combined.includes(keyword));
            const goodForSports = pub.goodForWatchingSports === true;
            
            if (!isBarType || (!goodForSports && !hasSportsKeyword)) {
                console.log('Filtered out (not sports bar):', pub.name);
                return false;
            }
        }
        
        if (historicFilter === 'priority') {
            const name = pub.name.toLowerCase();
            const summary = (pub.editorial_summary || '').toLowerCase();
            const combined = name + ' ' + summary;
            const hasPriorityKeyword = historicKeywords.some(keyword => combined.includes(keyword));
            if (!hasPriorityKeyword) {
                console.log('Filtered out by keywords:', pub.name);
                return false;
            }
        }
        
        return true;
    });
    
    console.log('After filtering:', filtered.length, 'pubs remain');
    return filtered;
}

function selectBestPubs(pubs, numPubs, center) {
    const withDistance = pubs.map(pub => {
        const location = pub.geometry.location;
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(center.lat, center.lng),
            location
        );

        return { ...pub, distance };
    });

    withDistance.sort((a, b) => {
        const distanceDiff = a.distance - b.distance;
        if (Math.abs(distanceDiff) > 100) {
            return distanceDiff;
        }
        return (b.rating || 0) - (a.rating || 0);
    });

    console.log('Sorted pubs by distance:');
    withDistance.slice(0, 10).forEach((p, i) => {
        console.log(`${i+1}. ${p.name} - ${Math.round(p.distance)}m, rating: ${p.rating}`);
    });

    const requestedNum = parseInt(numPubs);
    const availableNum = withDistance.length;

    if (availableNum < requestedNum) {
        console.warn(`Only found ${availableNum} pubs, user requested ${requestedNum}`);
        window.insufficientPubs = {
            found: availableNum,
            requested: requestedNum
        };
    } else {
        window.insufficientPubs = null;
    }

    const selected = withDistance.slice(0, Math.min(availableNum, requestedNum));
    console.log('Selected', selected.length, 'pubs for route');

    return selected;
}

function optimizeRoute(pubs, originalLocation) {
    if (pubs.length === 0) return [];
    
    let startPubIndex = 0;
    let minDistToStart = Infinity;
    
    pubs.forEach((pub, idx) => {
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(originalLocation.lat, originalLocation.lng),
            pub.geometry.location
        );
        if (dist < minDistToStart) {
            minDistToStart = dist;
            startPubIndex = idx;
        }
    });
    
    const ordered = [];
    const remaining = [...pubs];
    const startPub = remaining.splice(startPubIndex, 1)[0];
    ordered.push(startPub);
    
    let current = { 
        lat: startPub.geometry.location.lat(), 
        lng: startPub.geometry.location.lng() 
    };
    
    while (remaining.length > 0) {
        let nearest = 0;
        let minDist = Infinity;
        
        remaining.forEach((pub, idx) => {
            const loc = pub.geometry.location;
            const dist = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(current.lat, current.lng),
                loc
            );
            
            if (dist < minDist) {
                minDist = dist;
                nearest = idx;
            }
        });
        
        const pub = remaining.splice(nearest, 1)[0];
        ordered.push(pub);
        current = { lat: pub.geometry.location.lat(), lng: pub.geometry.location.lng() };
    }
    
    console.log(`Route starts from: ${ordered[0].name} (closest to entered location)`);
    return ordered;
}

function calculateDirections(pubs) {
    return new Promise((resolve, reject) => {
        if (pubs.length < 2) {
            resolve();
            return;
        }
        
        const waypoints = pubs.slice(1, -1).map(pub => ({
            location: pub.geometry.location,
            stopover: true
        }));
        
        const request = {
            origin: pubs[0].geometry.location,
            destination: pubs[pubs.length - 1].geometry.location,
            waypoints: waypoints,
            travelMode: 'WALKING'
        };
        
        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                currentRouteData = result;
                resolve(result);
            } else {
                console.error('Directions failed:', status);
                resolve(null);
            }
        });
    });
}

function displayResults(pubs) {
    const bounds = new google.maps.LatLngBounds();
    pubs.forEach(pub => bounds.extend(pub.geometry.location));
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: bounds.getCenter(),
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });
    
    map.fitBounds(bounds);
    
    if (currentRouteData) {
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(currentRouteData);
    }
    
    pubs.forEach((pub, index) => {
        const marker = new google.maps.Marker({
            position: pub.geometry.location,
            map: map,
            label: {
                text: (index + 1).toString(),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
            },
            title: pub.name
        });

        marker.addListener('click', () => showPubDetails(pub));
    });

    displaySummary(pubs);
    displayPubList(pubs);
    
    document.getElementById('results-layout').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('results-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function displaySummary(pubs) {
    const summary = document.getElementById('route-summary');
    const totalDistance = currentRouteData ? 
        currentRouteData.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0) : 0;
    const totalDuration = currentRouteData ?
        currentRouteData.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0) : 0;

    let warningHtml = '';
    if (window.insufficientPubs) {
        const info = window.insufficientPubs;
        
        if (info.reason === 'distance' && info.actualDistance && info.maxDistance) {
            warningHtml = `
                <div style="background: #fef7e0; border-left: 4px solid #fbbc04; padding: 12px; margin-top: 12px; border-radius: 4px;">
                    <strong style="color: #b06000;">⚠️ Route exceeds maximum walking distance</strong>
                    <p style="font-size: 13px; color: #5f6368; margin-top: 8px; line-height: 1.5;">
                        This is the shortest route with ${info.found} venue${info.found !== 1 ? 's' : ''} (you requested ${info.requested}).
                        Actual distance: <strong>${(info.actualDistance / 1000).toFixed(1)}km</strong> 
                        (max: ${(info.maxDistance / 1000).toFixed(1)}km).
                        <br><strong>Try:</strong> Increase maximum walking distance, reduce number of stops, or choose a different location.
                    </p>
                </div>
            `;
        } else if (info.reason === 'distance') {
            warningHtml = `
                <div style="background: #fef7e0; border-left: 4px solid #fbbc04; padding: 12px; margin-top: 12px; border-radius: 4px;">
                    <strong style="color: #b06000;">⚠️ Fewer stops to fit distance limit</strong>
                    <p style="font-size: 13px; color: #5f6368; margin-top: 8px; line-height: 1.5;">
                        Only ${info.found} venue${info.found !== 1 ? 's' : ''} could fit within ${(info.maxDistance / 1000).toFixed(1)}km walking distance
                        (you requested ${info.requested} stops).
                        <br><strong>Try:</strong> Increase maximum walking distance to include more venues.
                    </p>
                </div>
            `;
        } else {
            warningHtml = `
                <div style="background: #fef7e0; border-left: 4px solid #fbbc04; padding: 12px; margin-top: 12px; border-radius: 4px;">
                    <strong style="color: #b06000;">⚠️ Not enough venues found</strong>
                    <p style="font-size: 13px; color: #5f6368; margin-top: 8px; line-height: 1.5;">
                        Only found ${info.found} venue${info.found !== 1 ? 's' : ''} matching your criteria, 
                        but you requested ${info.requested} stops.
                        <br><strong>Try:</strong> Reduce minimum rating, change filters, or choose a different location.
                    </p>
                </div>
            `;
        }
    }

    summary.innerHTML = `
        <h3>Your Pub Crawl Route</h3>
        <p><strong>${pubs.length} stops</strong></p>
        <p>${(totalDistance / 1000).toFixed(1)} km walking distance</p>
        <p>~${Math.round(totalDuration / 60)} minutes walking time</p>
        ${warningHtml}
        <p style="font-size: 12px; color