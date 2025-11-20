import axios from "axios";
import FormData from "form-data";

export const scanOCR = async (req, res) => {
  try {
    const { imageBase64, imageUrl } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "imageBase64 or imageUrl is required" });
    }

    const formData = new FormData();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("language", "eng");

    if (imageUrl) {
      // Option 1: use a direct image URL
      formData.append("url", imageUrl);
    } else {
      // Option 2: use base64
      let dataUri = imageBase64.trim();

      // If frontend sends only raw base64, wrap into proper data URI
      if (!dataUri.startsWith("data:")) {
        dataUri = `data:image/jpeg;base64,${dataUri}`;
      }

      formData.append("base64Image", dataUri);
    }

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      { headers: formData.getHeaders() }
    );

    const result = response.data;

    if (result.OCRExitCode !== 1) {
      return res.status(400).json({
        success: false,
        message: "OCR failed",
        error: result.ErrorMessage || result.ErrorDetails || "Unknown error",
      });
    }

    const rawText = result.ParsedResults[0].ParsedText || "";

    const vehicleNumber = rawText.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    return res.json({
      success: true,
      rawText,
      vehicleNumber,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal OCR Error",
      error: error.message,
    });
  }
};
