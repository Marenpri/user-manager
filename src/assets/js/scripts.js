$(function () {

    $('#dtBasicExample').DataTable({

        "ajax": "/user/data",
        "columns": [{
                "data": "personalInfo.name"
            },
            {
                "data": "personalInfo.last_name"
            },
            {
                "data": "personalInfo.phone"
            },
            {
                "data": "id"
            },
        ],
        "columnDefs": [{
            "render": function (data, type, row) {
                return `<div class="edition-icons"><button class="table-button" data-toggle="modal" data-target="#details-user" data-item="${data}">
                    <i class="fas fa-user-alt" data-toggle="tooltip" title="Ver usuario"></i></button>
                    <button class="table-button" data-toggle="modal" data-target="#edit-user" data-item="${data}">
                    <i class="fas fa-user-edit" data-toggle="tooltip" title="Editar usuario"></i></button>
                    <button class="table-button" data-toggle="modal" data-target="#modalDelete" data-item="${data}">
                    <i class="fas fa-user-minus delete-user" data-toggle="tooltip" title="Eliminar usuario"></i></button></div>`;
            },
            "targets": 3,
            orderable: false,
        }]
    }).on('draw', function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
    $('.dataTables_length').addClass('bs-select');

    $("#details-user").on('show.bs.modal', function (e) {
        const id = e.relatedTarget.attributes['data-item'].nodeValue;
        fetch('/user/' + id).then(res => res.json()).then(fc => {

            var mylabels = Object.keys(fc.selectSkills.skills);
            var myValues = Object.values(fc.selectSkills.skills);
            var logo = fc.img ? `
            <img class="logo-img" src="${fc.img}"/>
            ` : `<i class="fas fa-user-alt"></i>`
            var birth = moment(fc.selectUser.personalInfo.birthdate, 'DD-MM-YYYY');
            var today = moment();
            var age = today.diff(birth, "years");
            var info = `<h3>${fc.selectUser.personalInfo.name} ${fc.selectUser.personalInfo.last_name}</h3><hr>
            <div class="row" style="padding:25px">
                <div class="col-md-7">
                 <p><i class="fas fa-briefcase"></i><span> Profesión: </span>${fc.selectUser.personalInfo.info.profession}</p>
                    <p><i class="fas fa-user-clock"></i></i><span> Edad: </span>${age}</p>
                    <p><i class="fas fa-map-marked"></i><span> Dirección: </span>${fc.selectUser.personalInfo.info.address}</p>
                    <p><i class="fas fa-phone"></i><span> Teléfono: </span>${fc.selectUser.personalInfo.phone}</p>
                    <p><i class="fas fa-envelope"></i><span> Email: </span>${fc.selectUser.personalInfo.email}</p>
                 </div>
            <div class="col-md-5"><canvas id="pieChart"></canvas></div>`
            $('#details-user .modal-body').html(info);
            $('#img-logo').html(logo);

            var ctxP = document.getElementById("pieChart").getContext('2d');
            var myPieChart = new Chart(ctxP, {
                type: 'pie',
                data: {
                    labels: mylabels,
                    datasets: [{
                        data: myValues,
                        backgroundColor: ["#99f62f", "#f6ef30", "#ed1f48", "#d41fed", "#4D5360"],
                        hoverBackgroundColor: ["#99f62fc2", "#f6ef30c2", "#ed1f48c2", "#d41fedc2", "#616774"]
                    }]
                },
                options: {
                    responsive: true,
                    hoverBorderWidth: 2,
                    legend: {
                        position: 'right'
                    }
                },

            });
        })
    });

    $("#edit-user").on('show.bs.modal', function (e) {
        const id = e.relatedTarget.attributes['data-item'].nodeValue;
        fetch('/user/edit/' + id).then(res => res.json()).then(fc => {
            var logo = fc.img ? `
            <img class="logo-img" src="${fc.img}"/>
            ` : `<i class="fas fa-user-alt"></i>`
            var info = `<h3>${fc.selectUser.personalInfo.name} ${fc.selectUser.personalInfo.last_name}</h3><hr>`

            $('#edit-user .modal-body #header-body').html(info);
            $('#img-logo-edit').html(logo);
            $('#phone').val(fc.selectUser.personalInfo.phone);
            $('label#label-phone').addClass('active');
            $('#email').val(fc.selectUser.personalInfo.email);
            $('label#label-email').addClass('active');
            $('#address').val(fc.selectUser.personalInfo.info.address);
            $('label#label-address').addClass('active');
            $('#id-item').val(id);
        })
    });
    $('#phone').on('keyup', function () {
        if (!/[1-9][0-9]{7,11}$/.test($('#phone').val())) {
            $('#phone').addClass('invalid-input');
            $('#error-phone').css('display', 'block');
        } else {
            $('#phone').removeClass('invalid-input');
            $('#error-phone').css('display', 'none');
        }
    })
    $('#email').on('keyup', function () {
        if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test($('#email').val())) {
            $('#email').addClass('invalid-input');
            $('#error-email').css('display', 'block');
        } else {
            $('#email').removeClass('invalid-input');
            $('#error-email').css('display', 'none');
        }
    })
    $("#send-edit").on('click', function (e) {
        const id = $('#id-item').val();
        let valid = true;
        if (!/[1-9][0-9]{7,11}$/.test($('#phone').val())) {
            $('#phone').addClass('invalid-input');
            $('#error-phone').css('display', 'block');
            valid = false;
        }
        if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test($('#email').val())) {
            $('#email').addClass('invalid-input');
            $('#error-email').css('display', 'block');
            valid = false;
        }
        if (valid) {
            fetch('/user/edit/' + id, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({
                    phone: $('#phone').val(),
                    email: $('#email').val(),
                    address: $('#address').val()
                })
            }).then(res => {
                if (res.status === 200) {
                    $('#dtBasicExample').DataTable().ajax.reload();
                    $("#edit-user").modal('hide');
                    setTimeout(() => {
                        $("#modalSuccess").modal('show')
                    }, 500);
                }
            })
        }


    });
    $("#modalDelete").on('show.bs.modal', function (e) {
        const id = e.relatedTarget.attributes['data-item'].nodeValue;
        fetch('/user/delete/' + id).then(res => res.json()).then(fc => {
            var logo = fc.img ? `
             <img class="img-fluid z-depth-1-half rounded-circle" src="${fc.img}" alt="IMG of Avatars")
              <p class="title mb-0">${fc.selectUser.personalInfo.name} ${fc.selectUser.personalInfo.last_name}</p>
              <p class="text-muted" style="font-size: 13px"> ${fc.selectUser.personalInfo.info.profession}</p>
            ` : `<i class="fas fa-user-alt"></i>`
            $('#left-logo').html(logo);
            $('#id-item-delete').val(id);
        })
    });
    $("#delete-user").on('click', function (e) {
        const id = $('#id-item-delete').val();

        fetch('/user/delete/' + id, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'post',
        }).then(res => {
            if (res.status === 200) {
                $('#dtBasicExample').DataTable().ajax.reload();
                $("#modalDelete").modal('hide');
                setTimeout(() => {
                    $("#modalSuccess").modal('show')
                }, 500);
            }
        })
    });
    (function () {
        'use strict';
        window.addEventListener('load', function () {
            var forms = document.getElementsByClassName('needs-validation');
            var validation = Array.prototype.filter.call(forms, function (form) {
                form.addEventListener('submit', function (event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    })();
});