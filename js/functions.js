const baseUrl = 'http://api.dataatwork.org/v1/'
const autoUrl = baseUrl + '/jobs/autocomplete?contains=';

let results = document.getElementById('results');
let spin = document.getElementById('spinner');
let modaltemp = document.getElementById('modal');
let modal = new bootstrap.Modal(modaltemp);

async function submit() {
    let rawdata = $('form').serialize();
    let arr = rawdata.split('&');

    let district = arr[arr.length - 4].substring(9);
    let jobs = arr.slice(9);
    let ids = [];
    for (let i = 0; i < 3; i++) {
        jobs[i] = jobs[i].substring(5);
        if (jobs[i] != '') {
            let temp = await getUuid(jobs[i], i+1)
            ids[i] = temp[0]
            jobs[i] = temp[1];
        }
    }

    if (ids.includes(undefined)) {
        return;
    }

    spin.hidden = false;
    results.hidden = true;
    modal.show();

    let skills = [];
    for (let i = 0; i < ids.length; i++) {
        skills[i] = await getSkills(ids[i], jobs[i]);
    }

    if (skills.includes(undefined)) {
        return;
    }

    showModal(jobs, ids, skills);    
}

async function getUuid(name, i) {
    let data = await fetch(autoUrl + `${name}&begins_with=${name}&ends_with=${name}`);
    if (data.status == 404) {
        $('#alert' + i).css('visibility', 'visible');
        setTimeout(() => {
            $('#alert' + i).css('visibility', 'hidden')
        }, 3000);
        return;
    }
    let resp = await data.json();
    return [resp[0].uuid, resp[0].suggestion];
}

async function getSkills(uuid, job) {
    let data = await fetch(baseUrl + `/jobs/${uuid}/related_skills`)
    if (data.status == 404) {
        modal.hide();
        alert(`Unfortunately, the job title '${job}' is missing the skills associated with it. Please retry your search with a different job.`)
        return;
    }
    let resp = await data.json();
    return resp.skills.slice(0, 3);
}

function showModal(jobs, ids, skills) {
    let headers = document.getElementsByClassName('result-headers');
    let titles = document.getElementsByClassName('result-skills');
    let desc = document.getElementsByClassName('result-descs');
    let sets = document.getElementsByClassName('skillset');

    for (let i = 0; i < ids.length; i++) {
        sets[i].hidden = false;
        headers[i].innerHTML = jobs[i];
        for (let j = 0; j < 3; j++) {
            titles[i * 3 + j].innerHTML = skills[i][j]['skill_name'].replace(/\b\w/g, l => l.toUpperCase())
            desc[i * 3 + j].innerHTML = skills[i][j].description.charAt(0).toUpperCase() + skills[i][j].description.slice(1);
        }
    }

    let collapse = document.getElementsByClassName('collapse');
    for (let i = 0; i < collapse.length; i++) {
        collapse[i].classList.remove('show');
    }
    
    for (let i = ids.length; i < 3; i++) {
        sets[i].hidden = true;
    }

    spin.hidden = true;
    results.hidden = false;
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