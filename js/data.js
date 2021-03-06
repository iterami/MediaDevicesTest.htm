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
