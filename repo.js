'use strict';

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(){
            reset_audio();
            reset_video();
        }
      },
      'events': {
        'left_audio': {
          'onclick': function(){
              audio_start('boop_left');
          },
        },
        'middle_audio': {
          'onclick': function(){
              audio_start('boop');
          },
        },
        'reset_audio': {
          'onclick': reset_audio,
        },
        'reset_video': {
          'onclick': reset_video,
        },
        'right_audio': {
          'onclick': function(){
              audio_start('boop_right');
          },
        },
        'test_audio': {
          'onclick': function(){
              navigator.mediaDevices.getUserMedia({
                'audio': true,
                'video': false,
              }).then(test_audio).catch(test_audio_error);
          },
        },
        'test_video': {
          'onclick': function(){
              navigator.mediaDevices.getUserMedia({
                'audio': false,
                'video': true,
              }).then(test_video).catch(test_video_error);
          },
        },
      },
      'globals': {
        'node': 0,
        'stream_audio': 0,
        'stream_video': 0,
      },
      'info': '<table class=center><tr><td><button id=test_audio type=button>Audio Input Test</button><button id=reset_audio type=button>Reset</button><td><div id=results_audio></div><progress class=hidden id=results_audio_volume max=100 min=0 value=0></progress>'
        + '<tr><td>Audio Output Test<td><button id=left_audio type=button>Left</button><button id=middle_audio type=button>Middle</button><button id=right_audio type=button>Right</button>'
        + '<tr><td><button id=test_video type=button>Video Test</button><button id=reset_video type=button>Reset</button><td><div id=results_video></div><video class=hidden controls id=video></video></table>',
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
      'boop_left': {
        'panner': {
          'positionX': -1,
        },
      },
      'boop_right': {
        'panner': {
          'positionX': 1,
        },
      },
    });
}

function reset_audio(){
    if(stream_audio !== 0){
        const tracks = stream_audio.getTracks();
        tracks.forEach(function(track){
            track.stop();
        });
        stream_audio = 0;
    }

    if(node !== 0){
        node.disconnect();
        node.onaudioprocess = void 0;
        node = 0;
    }

    core_elements.results_audio.textContent = '';
    core_elements.results_audio_volume.classList.add('hidden');
}

function reset_video(){
    if(stream_video !== 0){
        const tracks = stream_video.getTracks();
        tracks.forEach(function(track){
            track.stop();
        });
        stream_video = 0;
    }

    core_elements.results_video.textContent = '';
    const video = core_elements.video;
    video.classList.add('hidden');
    video.pause();
    video.removeAttribute('srcObject');
    video.removeAttribute('src');
    video.load();
}

function test_audio(stream){
    stream_audio = stream;
    const context = new AudioContext();

    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = .8;
    analyser.fftSize = 1024;

    const input = context.createMediaStreamSource(stream_audio);
    input.connect(analyser);

    node = context.createScriptProcessor(2048, 1, 1);
    analyser.connect(node);

    const element = core_elements.results_audio_volume;
    node.connect(context.destination);
    node.onaudioprocess = function(){
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        let result = 0;
        for(let i = 0; i < array.length; i++){
            result += array[i];
        }

        element.value = result / array.length;
    };

    element.classList.remove('hidden');
    core_elements.results_audio.textContent = stream_audio.id;
}

function test_audio_error(error){
    reset_audio();
    core_elements.results_audio.textContent = error.name;
}

function test_video(stream){
    stream_video = stream;

    const tracks = stream_video.getVideoTracks();
    core_elements.results_video.textContent = tracks[0].label;

    core_elements.video.srcObject = stream;
    core_elements.video.classList.remove('hidden');
    core_elements.video.play();
}

function test_video_error(error){
    reset_video();
    core_elements.results_video.textContent = error.name;
}
