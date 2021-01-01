const baseUrl = 'http://api.dataatwork.org/v1/'
const autoUrl = baseUrl + '/jobs/autocomplete?contains=';

function submit() {
    let rawdata = $('form').serialize();
    let arr = rawdata.split('&');

    let district = arr[arr.length - 4].substring(9);
    let jobs = arr.slice(9);
    for (var i = 0; i < 3; i++) {
        jobs[i] = jobs[i].substring(5);
    }

    fetch(url)
    .then(data => data.json())
    .then(resp => console.log(resp));

    
}

let job1 = document.getElementById('job1')
let job2 = document.getElementById('job2')
let job3 = document.getElementById('job3')

job1.addEventListener('input', () => autocomplete(job1)); 
job2.addEventListener('input', () => autocomplete(job2)); 
job3.addEventListener('input', () => autocomplete(job3)); 

function autocomplete(element) {
    let text = element.value;
    if (text.length < 4) return;
    fetch(autoUrl + text)
    .then(data => data.json())
    .then(resp => {
        let list = document.getElementById(element.id + 'list');
        list.textContent = '';
        for (let i = 0; i < 10 && i < resp.length; i++) {
            let opt = document.createElement('option');
            opt.value = resp[i].suggestion;
            list.appendChild(opt);
        }
    })
};