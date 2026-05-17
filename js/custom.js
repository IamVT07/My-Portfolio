(function ($) {

"use strict";

    // PRE LOADER (Keep this old code for the loading animation)
    $(window).on('load', function(){
      $('.preloader').fadeOut(1000); 
    });

    // CUSTOM LINK (Keep this code for scrolling navigation)
    $('.custom-link').click(function(e){
        e.preventDefault();
        var el = $(this).attr('href');
        var elWrapped = $(el);
        var header_height = $('.navbar').height() + 10;
        
        $('body,html').animate({
            scrollTop: elWrapped.offset().top - header_height
        }, 300);
        return false;
    });

    // -------------------------------------------------------------
    // NEW: CONTACT FORM SUBMISSION TO NODE.JS SERVER
    // -------------------------------------------------------------
    $(document).on('submit', '#contactForm', function(e) {
        e.preventDefault();
        
        const formStatus = $('#formStatus');
        formStatus.text('Sending message...').css('color', '#ffc107'); // Yellow/Caution

        // 1. Gather all data points using jQuery's .val()
        const formData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(), // Ensure your HTML input has id="phone"
            subject: $('#subject').val(),     // Ensure your HTML select has id="subject"
            message: $('#message').val().trim()
        };

        // Basic Validation (Client-Side)
        if (!formData.name || !formData.email || !formData.message) {
            formStatus.text('Please fill out all required fields.').css('color', '#dc3545'); // Red/Danger
            return;
        }

        // 2. Send the POST request to the Node.js API
        const serverUrl = '/api/contact';
        fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(formData), 
        })
        .then(response => {
            if (!response.ok) {
                // If server is running but returns an error status (400 or 500)
                throw new Error('Server request failed. Status: ' + response.status);
            }
            return response.json(); 
        })
       // ---------------- यहाँ से बदलें ----------------
        .then(data => {
            // 3. Success Feedback (यहाँ असली पॉपअप आएगा)
            alert("Thank you for your message! I will connect with you soon.");
            
            // फॉर्म को खाली करें
            document.getElementById("contactForm").reset(); 
            formStatus.text(''); // अगर कोई पुराना लोडिंग टेक्स्ट हो तो उसे हटा दें
        })
        .catch((error) => {
            // 4. Failure Feedback
            console.error('Submission Error:', error);
            alert("Oops! Connection error. Please try again.");
            formStatus.text('');
        });
        // ---------------- यहाँ तक ----------------
    });
    
})(window.jQuery);