    function addTocart(proId){
        $.ajax({
        url: '/add-tocart/' + proId, 
        method: 'get',
        success: (response) => {
            if (response.status) {
                alert(response)
                let count = $('#cart-count').html() 
                   counts = parseInt(count) + 1
                $('#cart-count').html(counts)
            }
        }
    })}
