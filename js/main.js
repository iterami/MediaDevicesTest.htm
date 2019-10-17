'use strict';

function repo_escape(){
    audio_reset();
    video_reset();
}

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(){
            audio_reset();
            video_reset();
        }
      },
      'events': {
        'audio-reset': {
          'onclick': audio_reset,
        },
        'audio-test': {
          'onclick': function(){
              navigator.mediaDevices.getUserMedia({
                'audio': true,
                'video': false,
              }).then(function(stream){
                  audio_stream = stream;

                  document.getElementById('results-audio').innerHTML = audio_stream.id;

              }).catch(function(error){
                  audio_reset();

                  document.getElementById('results-audio').innerHTML = error.name;
              });
          },
        },
        'video-reset': {
          'onclick': video_reset,
        },
        'video-test': {
          'onclick': function(){
              navigator.mediaDevices.getUserMedia({
                'audio': false,
                'video': true,
              }).then(function(stream){
                  video_stream = stream;

                  let tracks = video_stream.getVideoTracks();
                  document.getElementById('results-video').innerHTML = tracks[0].label;

                  let video_element = document.getElementById('video-element');
                  video_element.classList.remove('hidden');
                  video_element.srcObject = stream;
                  video_element.play();

              }).catch(function(error){
                  video_reset();

                  document.getElementById('results-video').innerHTML = error.name;
              });
          },
        },
      },
      'globals': {
        'audio_stream': 0,
        'video_stream': 0,
      },
      'info': '<input id=audio-test type=button value="Test Audio"><input id=audio-reset type=button value=Reset> <span id=results-audio></span><hr>'
        + '<input id=video-test type=button value="Test Video"><input id=video-reset type=button value=Reset> <span id=results-video></span><br>'
        + '<video class=hidden controls id=video-element></video>',
      'menu': true,
      'title': 'MediaDevicesTest.htm',
    });
}
