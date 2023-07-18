'use strict';

function audio_reset(){
    if(audio_stream !== 0){
        const tracks = audio_stream.getTracks();
        tracks.forEach(function(track){
            track.stop();
        });
        audio_stream = 0;
    }

    if(audio_node !== false){
        audio_node.disconnect();
        audio_node.onaudioprocess = void 0;
        audio_node = false;
    }

    const audio_volume_element = document.getElementById('audio-volume-range');
    audio_volume_element.classList.add('hidden');
    audio_volume_element.value = 0;

    document.getElementById('results-audio').textContent = '';
}

function repo_escape(){
    if(!core_menu_open){
        audio_reset();
        video_reset();
    }
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

                  const audio_volume_element = document.getElementById('audio-volume-range');
                  audio_volume_element.classList.remove('hidden');

                  document.getElementById('results-audio').textContent = audio_stream.id;

                  const audio_context = new AudioContext();
                  const audio_analyser = audio_context.createAnalyser();

                  audio_analyser.smoothingTimeConstant = .8;
                  audio_analyser.fftSize = 1024;

                  const input = audio_context.createMediaStreamSource(audio_stream);
                  audio_node = audio_context.createScriptProcessor(
                    2048,
                    1,
                    1
                  );

                  input.connect(audio_analyser);
                  audio_analyser.connect(audio_node);

                  audio_node.connect(audio_context.destination);
                  audio_node.onaudioprocess = function(){
                      const array = new Uint8Array(audio_analyser.frequencyBinCount);
                      audio_analyser.getByteFrequencyData(array);

                      let result = 0;
                      for(let i = 0; i < array.length; i++){
                          result += array[i];
                      }
                      audio_volume_element.value = result / array.length;
                  };

              }).catch(function(error){
                  audio_reset();

                  document.getElementById('results-audio').textContent = error.name;
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

                  const tracks = video_stream.getVideoTracks();
                  document.getElementById('results-video').textContent = tracks[0].label;

                  const video_element = document.getElementById('video-element');
                  video_element.classList.remove('hidden');
                  video_element.srcObject = stream;
                  video_element.play();

              }).catch(function(error){
                  video_reset();

                  document.getElementById('results-video').textContent = error.name;
              });
          },
        },
      },
      'globals': {
        'audio_stream': 0,
        'audio_node': false,
        'video_stream': 0,
      },
      'info': '<input id=audio-test type=button value="Test Audio"><input id=audio-reset type=button value=Reset> <span id=results-audio></span><br>'
        + '<input class=hidden disabled id=audio-volume-range max=100 min=0 type=range value=0><hr>'
        + '<input id=video-test type=button value="Test Video"><input id=video-reset type=button value=Reset> <span id=results-video></span><br>'
        + '<video class=hidden controls id=video-element></video>',
      'menu': true,
      'title': 'MediaDevicesTest.htm',
    });
}

function video_reset(){
    if(video_stream !== 0){
        const tracks = video_stream.getTracks();
        tracks.forEach(function(track){
            track.stop();
        });
        video_stream = 0;
    }

    const video_element = document.getElementById('video-element');
    video_element.classList.add('hidden');
    video_element.pause();
    video_element.removeAttribute('srcObject');
    video_element.removeAttribute('src');
    video_element.load();

    document.getElementById('results-video').textContent = '';
}
