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

    core_elements['audio-volume-range'].classList.add('hidden');
    core_elements['audio-volume-range'].value = 0;

    core_elements['results-audio'].textContent = '';
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

                  const audio_volume_element = core_elements['audio-volume-range'];
                  audio_volume_element.classList.remove('hidden');

                  core_elements['results-audio'].textContent = audio_stream.id;

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

                  core_elements['results-audio'].textContent = error.name;
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
                  core_elements['results-video'].textContent = tracks[0].label;

                  core_elements['video-element'].classList.remove('hidden');
                  core_elements['video-element'].srcObject = stream;
                  core_elements['video-element'].play();

              }).catch(function(error){
                  video_reset();

                  core_elements['results-video'].textContent = error.name;
              });
          },
        },
      },
      'globals': {
        'audio_stream': 0,
        'audio_node': false,
        'video_stream': 0,
      },
      'info': '<button id=audio-test type=button>Audio Test</button><button id=audio-reset type=button>Reset</button> <span id=results-audio></span><br>'
        + '<input class=hidden disabled id=audio-volume-range max=100 min=0 type=range value=0><hr>'
        + '<button id=video-test type=button>Video Test</button><button id=video-reset type=button>Reset</button> <span id=results-video></span><br>'
        + '<video class=hidden controls id=video-element></video>',
      'menu-lock': true,
      'title': 'MediaDevicesTest.htm',
      'ui-elements': [
        'audio-volume-range',
        'results-audio',
        'results-video',
        'video-element',
      ],
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

    core_elements['video-element'].classList.add('hidden');
    core_elements['video-element'].pause();
    core_elements['video-element'].removeAttribute('srcObject');
    core_elements['video-element'].removeAttribute('src');
    core_elements['video-element'].load();

    core_elements['results-video'].textContent = '';
}
