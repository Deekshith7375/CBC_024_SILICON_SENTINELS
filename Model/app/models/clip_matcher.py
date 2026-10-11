import torch
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from app.config import CLIP_MODEL_NAME, DEVICE, DEFAULT_SIMILARITY_THRESHOLD
from app.schemas.request_response import ProductMatchResult

class CLIPProductMatcher:
    """
    Product visual similarity matcher using CLIP Image Embeddings & Cosine Similarity.
    Calculates product match score scaled from 0% to 100%.
    """

    def __init__(self, model_name: str = CLIP_MODEL_NAME):
        self.device = DEVICE
        self.model_name = model_name
        print(f"[CLIPProductMatcher] Loading CLIP model '{model_name}' on device '{self.device}'...")
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()
        print("[CLIPProductMatcher] CLIP model initialized successfully.")

    @torch.no_grad()
    def get_image_embedding(self, image: Image.Image) -> torch.Tensor:
        """
        Extract normalized feature embedding vector from a PIL Image.
        """
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        features_output = self.model.get_image_features(**inputs)
        
        # Handle tensor vs output dataclass in transformers
        if isinstance(features_output, torch.Tensor):
            image_features = features_output
        elif hasattr(features_output, "image_embeds"):
            image_features = features_output.image_embeds
        elif hasattr(features_output, "pooler_output"):
            image_features = features_output.pooler_output
        else:
            image_features = features_output[0]

        # Normalize the embedding vector to unit length
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        return image_features

    def calculate_similarity(
        self, 
        reference_image: Image.Image, 
        returned_image: Image.Image,
        threshold: float = DEFAULT_SIMILARITY_THRESHOLD
    ) -> ProductMatchResult:
        """
        Calculate cosine similarity between reference product image and returned item image.
        Returns a score from 0.0% to 100.0% and boolean match decision.
        """
        emb_ref = self.get_image_embedding(reference_image)
        emb_ret = self.get_image_embedding(returned_image)
        
        # Compute Cosine Similarity between unit vectors
        cosine_sim = torch.mm(emb_ref, emb_ret.T).item()
        
        # Convert cosine similarity to 0.0 - 100.0 percentage score
        # Cosine similarity for normalized CLIP embeddings ranges from ~0.0 to 1.0
        similarity_score = round(float(np.clip(cosine_sim, 0.0, 1.0)) * 100.0, 2)
        
        is_match = similarity_score >= threshold
        verdict = "MATCH" if is_match else "MISMATCH"

        return ProductMatchResult(
            similarity_score=similarity_score,
            is_match=is_match,
            threshold_used=threshold,
            verdict=verdict
        )

# Global singleton instance
_clip_matcher_instance = None

def get_clip_matcher() -> CLIPProductMatcher:
    global _clip_matcher_instance
    if _clip_matcher_instance is None:
        _clip_matcher_instance = CLIPProductMatcher()
    return _clip_matcher_instance
