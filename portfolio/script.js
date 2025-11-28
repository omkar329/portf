// Portfolio contact form -> send to backend at port 3001
(() => {
    const backendUrl = 'http://localhost:3001';
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = this.querySelector('.submit-btn') || this.querySelector('button[type="submit"]');
        const name = (this.querySelector('[name="name"]') || {}).value || '';
        const email = (this.querySelector('[name="email"]') || {}).value || '';
        const message = (this.querySelector('[name="message"]') || {}).value || '';
        const subject = (this.querySelector('[name="subject"]') || {}).value || '';

        if (!name || !email || !message) {
            alert('Please fill name, email and message.');
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Sending...';
            }

            const res = await fetch(backendUrl + '/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });

            // If server returns HTML error page (501 from python), handle gracefully
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                let errText = await res.text();
                console.error('Contact send failed:', res.status, errText);
                alert('Failed to send message. Server responded with ' + res.status + '.');
            } else if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) {
                    alert('Message sent — thank you!');
                    form.reset();
                } else {
                    alert('Failed to send message: ' + (data.error || 'unknown'));
                }
            } else {
                // unexpected content (HTML)
                const text = await res.text();
                console.error('Unexpected response:', text);
                alert('Unexpected server response. See console for details.');
            }
        } catch (err) {
            console.error('Contact send error:', err);
            alert('Network error while sending message.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Send Message';
            }
        }
    });
})();
