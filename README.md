<<<<<<< HEAD
<<<<<<< HEAD
﻿Profile image

- The About section no longer includes a built-in placeholder image.
- To add your own profile image back into the About section, place an image in the `assets/` folder and update the `src` attribute in `index.html` and `portfolio/index.html` to point to that file (for example `assets/profile.jpg`).
- Recommended sizes:
  - Square profile image: 400x400px (PNG or JPG) for best results.
  - Keep file under ~300KB for fast loading.
- Example PowerShell commands to copy an image into the project and wire it up:

```powershell
# Copy your image into the assets folder and name it profile.jpg
Copy-Item C:\path\to\my-photo.jpg -Destination .\assets\profile.jpg
# Edit index.html and portfolio/index.html to include:
# <img src="assets/profile.jpg" alt="Your Name" class="about-photo">
```

If you want, I can add the image back for you — upload the photo and I'll place it in `assets/` and update both pages.
=======
# portfolio
>>>>>>> 93b95caf281c33192293e3fa8a102f52e0963bc5
=======
# portf
>>>>>>> 113f3695940c5d268e13ea2c9a2bb771d29f82aa
