'use strict';

function audio_reset(){
    if(audio_stream !== 0){
        let tracks = audio_stream.getTracks();
        tracks.forEach(function(track){
            track.stop();
        });
        audio_stream = 0;
    }

    document.getElementById('results-audio').innerHTML = '';
}

function video_reset(){
    if(video_stream !== 0){
        let tracks = video_stream.getTracks();
        tracks.forEach(function(track){
            track.stop();
        });
        video_stream = 0;
    }

    let video_element = document.getElementById('video-element');
    video_element.classList.add('hidden');
    video_element.pause();
    video_element.removeAttribute('srcObject');
    video_element.removeAttribute('src');
    video_element.load();

    document.getElementById('results-video').innerHTML = '';
}