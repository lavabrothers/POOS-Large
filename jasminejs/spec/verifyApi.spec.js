describe("Tests verification email generation API: ", function () {
    it("Should return a HTML email page", async function () {
        const response = await fetch("http://134.122.3.46:3000/api/verify?token=TOKENTEST")
        expect(response.status).toBe(200)
        expect(await response.text()).toBe(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
        button { padding: 10px 20px; font-size: 16px; }
      </style>
    </head>
    <body>
      <h1>Confirm Your Email Address</h1>
      <p>To verify your email, please click the confirm button below.</p>
      <form action="/api/verify-email" method="GET">
        <input type="hidden" name="token" value="TOKENTEST" />
        <button type="submit">Confirm</button>
      </form>
    </body>
    </html>
  `)

    })
})

describe('Tests reset-password API: ', function () {
    it('Should return a password reset form', async function () {
        const response = await fetch("http://134.122.3.46:3000/api/reset-password?token=dccef51aafaea31bbb5599da3c2310b0cc7d4888")
        expect(response.status).toBe(200)
        expect(await response.text()).toBe(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
        input { padding: 10px; margin: 5px; font-size: 16px; }
        button { padding: 10px 20px; font-size: 16px; }
        #feedback { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Reset Your Password</h1>
      <form id="resetForm">
        <input type="hidden" name="token" value="dccef51aafaea31bbb5599da3c2310b0cc7d4888" />
        <div>
          <input type="password" name="newPassword" placeholder="New Password" required />
        </div>
        <div>
          <input type="password" name="confirmPassword" placeholder="Confirm New Password" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      <div id="feedback"></div>

      <script>
        const form = document.getElementById('resetForm');
        const feedback = document.getElementById('feedback');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const token = form.elements.token.value;
          const newPassword = form.elements.newPassword.value;
          const confirmPassword = form.elements.confirmPassword.value;

          try {
            const res = await fetch('/api/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token, newPassword, confirmPassword })
            });

            const data = await res.json();
            if (data.error) {
              feedback.textContent = data.error;
              feedback.style.color = "red";
            } else {
              feedback.textContent = data.message || "Password has been reset successfully!";
              feedback.style.color = "green";
            }
          } catch (error) {
            console.error('Error:', error);
            feedback.textContent = "An error occurred. Please try again.";
            feedback.style.color = "red";
          }
        });
      </script>
    </body>
    </html>
  `)
    })
})