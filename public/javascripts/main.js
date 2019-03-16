window.onload = () => {

  
    const ironhackBCN = {
      lat: 41.3977381,
      lng: 2.190471916};
    const map = new google.maps.Map(
      document.getElementById('map'),
      {
        zoom: 16,
        center: ironhackBCN,
        disableDefaultUI: true
  
      }
    );
  
  
  

  const markers = [];

  const bounds = new google.maps.LatLngBounds();

  function getRooms() {
    axios
      .get("/rooms/api")
      .then(response => {
        placePlaces(response.data.places);
      })
      .catch(error => {
        console.log(error);
      });
  }

  function getRoomsDetail() {

    let roomId = document.getElementById('roomsDetail').getAttribute('data-id')

    axios
      .get(`/rooms/api/${roomId}`)
      .then(response => {
        placePlaces([response.data.places]);
      })
      .catch(error => {
        console.log(error);
      });
  }

  function placePlaces(places) {
    places.forEach(function(place) {
      const center = {
        lat: place.location.coordinates[1],
        lng: place.location.coordinates[0]
      };
      // a cada restaurante
      bounds.extend(center);
      const pin = new google.maps.Marker({
        position: center,
        map: map,
        title: place.name
      });
      map.setCenter(center)
      markers.push(pin);
    });
    // ao final do loop
    if (markers.length > 1) {map.fitBounds(bounds)}
    
  }

  if (document.getElementById('rooms')) {getRooms();}
  if (document.getElementById('roomsDetail')) {getRoomsDetail();}

  
  const geocoder = new google.maps.Geocoder();

document.getElementById('find').addEventListener('click', function () {
  geocodeAddress(geocoder, map);
});

function geocodeAddress(geocoder, resultsMap) {
  let address = document.getElementById('address').value;

  geocoder.geocode({ 'address': address }, function (results, status) {

    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      let marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
      document.getElementById('latitude').value = results[0].geometry.location.lat();
      document.getElementById('longitude').value = results[0].geometry.location.lng();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

};


