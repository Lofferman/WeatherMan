var key = "04a4384b84e6477a3666152f8885da09"


/* TODO */
// Add click event to temp ui to switch from F to C
// UI unhancements
// change Chrome icon based on current weather desc - api supplies icon url in current > "weather_icons" 


/*IMPORTANT*/
// Weather is updated every 30 mins
// API request limit is 1000/month



let weatherObject
let timestamp
// get req from sync storage
chrome.storage.sync.get(["weatherObject", "timestamp"], function(items){

  //if  weather object is empty, or doesnt exist. set to undefined
  if(!items.weatherObject || jQuery.isEmptyObject(items.weatherObject)){
    weatherObject = undefined
  }


  //Store weatherObject in local storage for 30 mins, after that set to undefined. this will trigger to get updated weather data
  if(items.timestamp+30*60000 <= Math.floor(Date.now())){
    weatherObject, timestamp = undefined;
  }

  //set storage val to instance
  timestamp = items.timestamp
  weatherObject = items.weatherObject
});

//options for api req
var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  //what to do when location request is accepted
  function success(pos) {
    var crd = pos.coords;
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    callWeather(crd.latitude,crd.longitude, weatherObject)

  }
  
  //error if location request fails or is declined
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  

  //check if weatherObj is undefined or empty, if yes, call for location request.
  if(weatherObject === undefined || jQuery.isEmptyObject(items.weatherObject)){
    navigator.geolocation.getCurrentPosition(success, error, options);
  }


  //call weather api
  function callWeather( lat, lon, weatherObj = null)
  {

    //if weather has not been called in the last 30 mins
    if(weatherObj == null || jQuery.isEmptyObject(weatherObj)){
      $.ajax({
        type: "GET",
        url: `http://api.weatherstack.com/current?access_key=04a4384b84e6477a3666152f8885da09&query=${lat},${lon}`,
        success: function(msg){
            
          //set sync storage with updated weatherObj and current timestamp(ms) 
          chrome.storage.sync.set({"weatherObject": msg, "timestamp": Math.floor(Date.now())}, function(){
            });
           
                var temp = document.getElementById('temp')
                temp.innerHTML =  `${(msg.current.temperature * 9/5) + 32} F`
                var location = document.getElementById('location')
                location.innerHTML = msg.location.name + ", " + msg.location.region
                var time = document.getElementById('timestamp')
                time.innerHTML = new Date(Math.floor(Date.now()).toLocaleTimeString()); 
                 }
       });
    }else
    //if weatherObj is in storage with a timestamp < 30 mins ago
    {
                var temp = document.getElementById('temp')
                temp.innerHTML =   `${(weatherObj.current.temperature * 9/5) + 32} F`
                var location = document.getElementById('location')
                location.innerHTML = weatherObj.location.name + ", " + weatherObj.location.region
                var time = document.getElementById('timestamp')
                time.innerHTML = new Date(timestamp).toLocaleTimeString(); 
    }
       
       return false
  }