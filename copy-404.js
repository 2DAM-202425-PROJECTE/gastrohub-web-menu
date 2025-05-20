import fs from "fs-extra"

// Function to copy 404.html to dist directory
async function copy404() {
  try {
    // Check if 404.html exists
    if (fs.existsSync("404.html")) {
      // Copy it to dist directory
      await fs.copy("404.html", "dist/404.html")
      console.log("✅ 404.html copied to dist directory successfully")
    } else if (fs.existsSync("public/404.html")) {
      // If it's in the public directory, copy from there
      await fs.copy("public/404.html", "dist/404.html")
      console.log("✅ public/404.html copied to dist directory successfully")
    } else {
      console.error("❌ 404.html not found in root or public directory")
    }
  } catch (err) {
    console.error("❌ Error copying 404.html:", err)
  }
}

// Execute the function
copy404()
