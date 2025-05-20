import { defineConfig } from "vite"
import { resolve } from "path"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

export default defineConfig({
  // Set the base path - this is important for production builds
  base: "./",

  // Configure asset handling
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure all assets are copied to the build directory
    assetsInlineLimit: 0, // Don't inline any assets as data URLs
    // Ensure assets are properly hashed and referenced
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split(".").at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img"
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            extType = "fonts"
          }
          return `assets/${extType}/[name][extname]`
        },
        chunkFileNames: "assets/js/[name].js",
        entryFileNames: "assets/js/[name].js",
      },
    },
  },

  // Resolve file paths
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@assets": resolve(__dirname, "./assets"),
    },
  },

  // Configure environment variables
  envPrefix: "VITE_",

  // Ensure public directory is copied as-is
  publicDir: "public",
})
