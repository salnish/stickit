$('#adminData').submit((e) => {
    e.preventDefault()
    $.ajax({

      url: '/admin/Login',
      method: 'post',
      data: $('#adminData').serialize(),
      success: (response) => {
        if(response.admin){
           location.href='/admin/land'
        }else{
          let msg =response
          document.getElementById("errorP").innerHTML = msg;

        }
          
      }
    })
  });
