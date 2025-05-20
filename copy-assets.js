import fs from "fs-extra"
import path from "path"

// Define source and destination directories
const sourceDir = "assets"
const destDir = "dist/assets"

// Create a function to copy assets
async function copyAssets() {
  try {
    // Ensure the destination directory exists
    await fs.ensureDir(destDir)

    // Copy the entire assets directory
    await fs.copy(sourceDir, destDir, {
      filter: (src) => {
        // Skip node_modules and hidden files
        return !src.includes("node_modules") && !path.basename(src).startsWith(".")
      },
    })

    console.log("Assets copied successfully!")
  } catch (err) {
    console.error("Error copying assets:", err)
  }
}

// Execute the function
copyAssets()
