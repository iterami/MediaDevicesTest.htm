'use strict';

function audio_output_left(){
    audio_start('boop-left');
}

function audio_output_middle(){
    audio_start('boop');
}

function audio_output_right(){
    audio_start('boop-right');
}

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

    core_elements.audio_volume.classList.add('hidden');
    core_elements.audio_volume.value = 0;

    core_elements.results_audio.textContent = '';
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
        'audio_left': {
          'onclick': audio_output_left,
        },
        'audio_middle': {
          'onclick': audio_output_middle,
        },
        'audio_right': {
          'onclick': audio_output_right,
        },
        'audio_reset': {
          'onclick': audio_reset,
        },
        'audio_test': {
          'onclick': function(){
              navigator.mediaDevices.getUserMedia({
                'audio': true,
                'video': false,
              }).then(function(stream){
                  audio_stream = stream;

                  const audio_volume_element = core_elements.results_audio_volume;
                  audio_volume_element.classList.remove('hidden');

                  core_elements.results_audio.textContent = audio_stream.id;

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

                  core_elements.results_audio.textContent = error.name;
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
                  core_elements.results_video.textContent = tracks[0].label;

                  core_elements.video.classList.remove('hidden');
                  core_elements.video.srcObject = stream;
                  core_elements.video.play();

              }).catch(function(error){
                  video_reset();

                  core_elements.results_video.textContent = error.name;
              });
          },
        },
      },
      'globals': {
        'audio_stream': 0,
        'audio_node': false,
        'video_stream': 0,
      },
      'info': '<button id=audio_test type=button>Audio Input Test</button><button id=audio_reset type=button>Reset</button> <span id=results_audio></span><br>'
        + '<progress class=hidden id=results_audio_volume max=100 min=0 value=0></progress>'
        + 'Audio Output Test:<button id=audio_left type=button>Left</button><button id=audio_middle type=button>Middle</button><button id=audio_right type=button>Right</button><br>'
        + '<button id=video-test type=button>Video Test</button><button id=video-reset type=button>Reset</button> <span id=results_video></span><br>'
        + '<video class=hidden controls id=video></video>',
      'menu_lock': true,
      'title': 'MediaDevicesTest.htm',
      'ui_elements': [
        'results_audio',
        'results_audio_volume',
        'results_video',
        'video',
      ],
    });

    audio_create({
      'boop-left': {
        'panner': {
          'positionX': -1,
        },
      },
      'boop-right': {
        'panner': {
          'positionX': 1,
        },
      },
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

    core_elements.video.classList.add('hidden');
    core_elements.video.pause();
    core_elements.video.removeAttribute('srcObject');
    core_elements.video.removeAttribute('src');
    core_elements.video.load();

    core_elements.results_video.textContent = '';
}
