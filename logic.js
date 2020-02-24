let parksArr = [
    "Acadia", "American Samoa", "Arches", "Badlands",
    "Big Bend", "Biscayne", "Black Canyon Of The Gunnison",
    "Bryce Canyon", "Canyonlands", "Capitol Reef", "Carlsbad Caverns",
    "Channel Islands", "Congaree", "Crater Lake", "Cuyahoga Valley",
    "Death Valley", "Denali", "Dry Tortugas", "Everglades",
    "Gates Of The Arctic", "Gateway Arch", "Glacier", "Glacier Bay",
    "Grand Canyon", "Grand Teton", "Great Basin", "Great Sand Dunes",
    "Great Smoky Mountains", "Guadalupe Mountains", "Haleakalā",
    "Hawaiʻi Volcanoes", "Hot Springs", "Indiana Dunes", "Isle Royale",
    "Joshua Tree", "Katmai", "Kenai Fjords", "Kings Canyon",
    "Kobuk Valley", "Lake Clark", "Lassen Volcanic", "Mammoth Cave",
    "Mesa Verde", "Mount Rainier", "North Cascades", "Olympic",
    "Petrified Forest", "Pinnacles", "Redwood", "Rocky Mountain",
    "Saguaro", "Sequoia", "Shenandoah", "Theodore Roosevelt",
    "Virgin Islands", "Voyageurs", "Wind Cave",
    "Wrangell - St. Elias", "Yellowstone", "Yosemite", "Zion"
];

function initMap(parkLat, parkLng) {
    if (!parkLat) { parkLat = -25.344; }
    if (!parkLng) { parkLng = 131.036; }
    var coords = { lat: parkLat, lng: parkLng };
    var map = new google.maps.Map(
        $('#googleMap')[0], { zoom: 5, center: coords });
    var marker = new google.maps.Marker({ position: coords, map: map });
}

$(document).ready(function () {

    // INITIAL SETTINGS
    $('#natlParkCards').hide();

    parksArr.sort();
    let option = createDropDown(parksArr);
    $('#parksDD').append(option);

    // EVENT LISTENERS
    $('#registerBtn').on('click', (e) => {
        $('#registerPg').css({ display: 'block' });
    });
    $('#btnSignUp').on('click', (e) => {
        console.log(e)
        e.preventDefault();
        const userEmail = $('#txtEmail-reg').val();
        console.log("user email: " + userEmail);
        const userPassword = $('#txtPassword-reg').val();
        console.log("user Password: " + userPassword);
        firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`The error code was ${errorCode} and the message was ${errorMessage}`);

            // ...
        });

    });

    // AUTHENTICATION LISTENER
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            console.log(`user ${displayName} with ${email} is signed in.`);
            // ...
        } else {
            // User is signed out.
            console.log('not user')
            // ...
        }
    });

    $('#parksDD').on('change', (e) => {
        let chosenPark = e.currentTarget.value;
        console.log(chosenPark);
        let parkKey = false;
        for (var key in parkLib) {
            if (key.indexOf(chosenPark) >= 0) {
                parkKey = parkLib[key];
                break;
            }
        }
        console.log(parkKey);
        if (parkKey) {
            let parkJSON = fetchPark(parkKey);
        } else {
            alert("National Park not found in database :(");
        }

    })
});

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyD_JJJkbBgIhUKpTaYdSpaP3iD1Rb5-ZyA",
    authDomain: "ds-code-edu-project.firebaseapp.com",
    databaseURL: "https://ds-code-edu-project.firebaseio.com",
    projectId: "ds-code-edu-project",
    storageBucket: "ds-code-edu-project.appspot.com",
    messagingSenderId: "882171137280",
    appId: "1:882171137280:web:a113bf2df3c835f74b77e5",
    measurementId: "G-ZX3S2BBBBK"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//   firebase.analytics();
const database = firebase.database();
// https://firebase.google.com/docs/auth/web/start


// Variables
// https://www.nationalpark-adventures.com/united-states-national-parks.html


// Functions
function createDropDown(parksArr) {
    let option = '';
    for (let park in parksArr) {
        option += '<option value="' + parksArr[park] +
            '">' + parksArr[park] + '</option>';
    }
    return option;
}

function fetchPark(parkKey) {
    const url = "https://developer.nps.gov/api/v1/parks";
    const api_key = "4pyAvwLGdhtnYuVqa2zyMdeF43XOqbsyCaO8AwsN";
    const queryURL = url + "?parkCode=" + parkKey +
        "&fields=entranceFees,images,standardHours&api_key=" + api_key + "&limit=1";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(response => {

        if (response.status = "OK") {
            console.log(response);
            console.log("Full name: " + response.data[0].fullName);
            let imgs = response.data[0].images;
            console.log(imgs.length + " images available");
            console.log("First image URL: " + response.data[0].images[0].url);
            let updatedBackgroundURL = response.data[0].images[0].url;
            $('body').css({
                background: `url("${updatedBackgroundURL}") no-repeat center center fixed`,
                '-webkit-background-size': 'cover',
                '-moz-background-size': 'cover',
                '-o-background-size': 'cover',
                'background-size': 'cover'
            });
            $('.carousel-inner').empty();
            // PUT THE IMAGES INTO THE CAROUSEL
            if (imgs.length > 0) {
                for (let img in imgs) {
                    $('<div class="carousel-item"><img class="d-block w-100" src="' + imgs[img].url + '"</div>').appendTo('.carousel-inner')
                }
            }
            $('.carousel-item').first().addClass('active');
            $('#imgsCarousel').carousel();

            // UPDATE THE PARK DESCRIPTION
            let updatedParkDesc = response.data[0].description;
            console.log("Park desc: " + updatedParkDesc)
            $('#parkDescCardText').html(updatedParkDesc);
            // UPDATE THE PARK MAP
            const parkLatLng = response.data[0].latLong;
            const parkLat = Number(parkLatLng.split("lat:")[1].split(",")[0]);
            console.log(`Park lat: ${parkLat}`);
            const parkLng = Number(parkLatLng.split("long:")[1]);
            console.log(`Park lng: ${parkLng}`);
            initMap(parkLat, parkLng);
            //UPDATE THE ENTRANCE FEES
            const fees = response.data[0].entranceFees;
            let parkFees = "<ul>";
            fees.forEach(fee => {
                let feeTitle = fee.title;
                // if (feeTitle.indexOf(" - ") > -1) {
                //     feeTitle = feeTitle.split(" - ")[0];
                // } else if (feeTitle.indexOf("(") > -1) {
                //     feeTitle = feeTitle.split("(")[0];
                // }
                const feeIndex = fee.cost.indexOf(".");
                const feeCost = fee.cost.slice(0,feeIndex+3);
                parkFees += `<li>${feeTitle}: $${feeCost}</li>`
            });
            parkFees += "</ul>"
            $('#feesCardText').html(parkFees);
            $('#natlParkCards').show();
            return response;
        } else {
            console.log("API call failed");
        }
    });

    

}