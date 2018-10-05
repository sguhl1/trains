$(document).ready(function(){
  
  const config = {
    apiKey: "AIzaSyDX9Drz-6RjpYWN9kdEmZdi1favokMogE4",
    authDomain: "train-schedule-5a326.firebaseapp.com",
    databaseURL: "https://train-schedule-5a326.firebaseio.com",
    projectId: "train-schedule-5a326",
    storageBucket: "train-schedule-5a326.appspot.com",
    messagingSenderId: "214364904486"
  };
  firebase.initializeApp(config);
 
  setInterval(function(){
    $('.current-time').html(moment().format('hh:mm:ss A'))
  }, 1000);

    const dataRef = firebase.database();
    let exacttime = moment();
    let newTime;

    $('#addtrainbutton').on('click', function(newtrain) {

      newtrain.preventDefault();

      var trainName = $('#trainName').val().trim();
      var trainDestination = $('#trainDestination').val().trim();
      var trainTime = moment($('#firstTrain').val().trim(),"HH:mm").format("X");
      var trainFreq = $('#trainFrequency').val().trim();

      if (trainName != '' && trainDestination != '' && trainTime != '' && trainFreq != '') {
        
        $('#trainName').val('');
        $('#trainDestination').val('');
        $('#firstTrain').val('');
        $('#trainFrequency').val('');

        exacttime = moment().format('X');

          dataRef.ref().child('trains').push({
            trainName: trainName,
            trainDestination: trainDestination,
            trainTime: trainTime,
            trainFreq: trainFreq,
            currentTime: exacttime,
          })
      }
    });

    function timeUpdater() {
      dataRef.ref().child('trains').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          exacttime = moment().format('X');
          dataRef.ref('trains/' + childSnapshot.key).update({
          currentTime: exacttime,
          })
        })    
      });
    };

    setInterval(timeUpdater, 60000);

    dataRef.ref().child('trains').on('value', function(snapshot){
      $('tbody').empty();
      
      snapshot.forEach(function(childSnapshot){
        var trainClass = childSnapshot.key;
        var trainId = childSnapshot.val();
        var firstTimeConverted = moment.unix(trainId.trainTime);
        var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
        var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
        var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

        if(timeDiff >= 0) {
          newTime = null;
          newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');

        } else {
          newTime = null;
          newTime = firstTimeConverted.format('hh:mm A');
          timeDiffTotal = Math.abs(timeDiff - 1);
        }

        $('tbody').append(`<tr class=${trainClass}><td>${trainId.trainName}</td><td>${trainId.trainDestination}</td><td>${trainId.trainFreq}</td><td>${newTime}</td><td>${timeDiffTotal}</td>`);

    });
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
    dataRef.ref().child('trains').on('child_changed', function(childSnapshot){
      
      var trainClass = childSnapshot.key;
      var trainId = childSnapshot.val();
      var firstTimeConverted = moment.unix(trainId.trainTime);
      var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
      var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
      var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

      if(timeDiff > 0) {
        newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');
      } else {
        newTime = firstTimeConverted.format('hh:mm A');
        timeDiffTotal = Math.abs(timeDiff - 1);
      } 

      $('.'+trainClass).html(`<td> ${trainId.trainName} </td><td>${trainId.trainDestination}</td><td>${trainId.trainFreq} </td><td>${newTime} </td><td>${timeDiffTotal}</td>`);

    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
});