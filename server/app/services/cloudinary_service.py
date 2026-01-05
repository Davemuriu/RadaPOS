import cloudinary
import cloudinary.uploader
import cloudinary.api

from app.config import Config

cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET,
    secure=True
)

class CloudinaryService:
    @staticmethod
    def upload_image(file, folder="radapos"):
        """
        Uploads an image to Cloudinary.
        Returns: dict with public_id and secure_url
        """
        try:
            result = cloudinary.uploader.upload(
                file,
                folder=folder,
                resource_type="image"
            )

            return {
                "public_id": result.get("public_id"),
                "url": result.get("secure_url")
            }

        except Exception as e:
            raise RuntimeError(f"Cloudinary upload failed: {str(e)}")

    @staticmethod
    def delete_image(public_id):
        """
        Deletes an image from Cloudinary using public_id
        """
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            raise RuntimeError(f"Cloudinary delete failed: {str(e)}")
