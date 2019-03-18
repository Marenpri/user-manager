const express = require('express');
const app = express();
const fetch = require('node-fetch');

const PORT = 8080;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(__dirname + '/src'));
app.set('view engine', 'pug');

let data = [];
let skills = [];

function getUserData() {
    return fetch('http://netzone.cl/bntf/api.users.prueba/skeleton/api/users', {
            headers: {
                'token': '%ca7b=E]bV?t_M8C(Q]qU{qzQTPJOX/%AoKVv3S`Z`"Uxh]uwBfnooPJ%DW9)]m'
            }
        })
        .then(res => res.json())
        .then(json => {
            const aux = json['response']['data'];
            for (const [i, a] of aux.entries()) {
                let id = Object.keys(a)[0];
                data[i] = {
                    id,
                    personalInfo: a[id]
                }
            }
        });
}

function getUserSkills() {
    return fetch('http://netzone.cl/bntf/api.users.prueba/skeleton/api/skills', {
            headers: {
                'token': '%ca7b=E]bV?t_M8C(Q]qU{qzQTPJOX/%AoKVv3S`Z`"Uxh]uwBfnooPJ%DW9)]m'
            }
        })
        .then(res => res.json())
        .then(json => {
            const aux = json['response']['data'];
            for (const [i, a] of aux.entries()) {
                let id = Object.keys(a)[0];
                skills[i] = {
                    id,
                    skills: a[id]
                }
            }
        });
}


function getUserImg(id) {
    return fetch('http://netzone.cl/bntf/api.users.prueba/skeleton/api/image_perfil', {
        headers: {
            'token': '%ca7b=E]bV?t_M8C(Q]qU{qzQTPJOX/%AoKVv3S`Z`"Uxh]uwBfnooPJ%DW9)]m',
            'iduser': id + '_photo'
        }
    }).then(res => {
        return res.buffer()
    })
}

app.get('/', function (req, res) {
    Promise.all([getUserData(),
        getUserSkills()
    ]).then(() => {
        res.render('index', {
            title: 'Gestor de usuarios',
            data: data
        })
    })

})
app.get('/user/data', function (req, res) {
    res.send({
        data
    })
})
app.get('/user/:id', function (req, res) {
    const id = req.params.id;
    const selectUser = data.find(elem => elem.id === id);
    const selectSkills = skills.find(elem => elem.id === id);
    getUserImg(id).then(img => {
        res.send({
            selectUser,
            selectSkills,
            img: 'data:image/jpg;base64,' + img.toString('base64')
        });
    })
})

app.get('/user/edit/:id', function (req, res) {
    const id = req.params.id;
    const selectUser = data.find(elem => elem.id === id);
    getUserImg(id).then(img => {
        res.send({
            selectUser,
            img: 'data:image/jpg;base64,' + img.toString('base64')
        });
    })
})

app.post('/user/edit/:id', function (req, res) {
    const id = req.params.id;
    const selectUser = data.find(elem => elem.id === id);
    selectUser.personalInfo.phone = req.body.phone;
    selectUser.personalInfo.email = req.body.email;
    selectUser.personalInfo.info.address = req.body.address
    res.send({
        status: 200
    })
})

app.get('/user/delete/:id', function (req, res) {
    const id = req.params.id;
    const selectUser = data.find(elem => elem.id === id);
    getUserImg(id).then(img => {
        res.send({
            selectUser,
            img: 'data:image/jpg;base64,' + img.toString('base64')
        });
    })
})

app.post('/user/delete/:id', function (req, res) {
    const id = req.params.id;
    const selectUser = data.findIndex(elem => elem.id === id);
    data.splice(selectUser, 1);
    res.send({
        status: 200
    })
})
app.listen(PORT, HOST);