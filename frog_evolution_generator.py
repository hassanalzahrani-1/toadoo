"""
Frog Evolution Icon Generator using Scenario API
Generates a single cohesive image showing six frog evolution stages
based on a detailed creative prompt (cartoonish, badge-style).
"""

import os
import time
import base64
import logging
from typing import Dict, List, Optional
import requests
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)


class ScenarioAPIError(Exception):
    """Custom exception for Scenario API errors"""
    pass


class FrogEvolutionGenerator:
    BASE_URL = 'https://api.cloud.scenario.com/v1'

    def __init__(self, api_key: Optional[str] = None, api_secret: Optional[str] = None):
        """
        Initialize Scenario API client.
        Uses Basic Auth with key:secret pair.
        """
        self.api_key = api_key or os.getenv("SCENARIO_API_KEY")
        self.api_secret = api_secret or os.getenv("SCENARIO_API_SECRET", "")

        if not self.api_key:
            raise ValueError("SCENARIO_API_KEY not found in environment variables")

        auth_string = f"{self.api_key}:{self.api_secret}"
        auth_encoded = base64.b64encode(auth_string.encode()).decode()

        self.headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_encoded}"
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((requests.RequestException, ScenarioAPIError)),
        reraise=True
    )
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make API request with retry logic."""
        url = f"{self.BASE_URL}/{endpoint}"
        response = requests.request(method, url, headers=self.headers, timeout=60, **kwargs)

        try:
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error: {e} | {response.text}")
            raise ScenarioAPIError(f"API request failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise ScenarioAPIError(f"Unexpected error: {e}")

    def generate_frog_evolution(self, prompt: str, model_id: str = "flux.1-dev",
                                width: int = 2048, height: int = 512,
                                steps: int = 30, guidance: float = 4.0) -> List[str]:
        """
        Generate a single image showing all 6 frog evolution stages.

        Args:
            prompt: Full multi-rank creative description
            model_id: Scenario model (default: flux.1-dev)
            width: Image width (wide layout for all ranks)
            height: Image height
            steps: Number of inference steps
            guidance: Guidance scale (how strongly to follow the prompt)

        Returns:
            List of URLs to generated images
        """
        payload = {
            "modelId": model_id,
            "prompt": prompt,
            "numInferenceSteps": steps,
            "guidance": guidance,
            "width": width,
            "height": height,
            "numSamples": 6,
            "transparent_background": True,
            "scheduler": "EulerAncestralDiscreteScheduler"
        }

        logger.info("🎨 Sending frog evolution generation request to Scenario...")
        response = self._make_request("POST", "generate/txt2img", json=payload)

        job_id = (
            response.get("job", {}).get("jobId")
            or response.get("jobId")
            or response.get("id")
        )

        if not job_id:
            raise ScenarioAPIError("No job ID found in response")

        logger.info(f"Job created successfully — ID: {job_id}")
        return self._poll_and_get_urls(job_id)

    def _poll_and_get_urls(self, job_id: str, max_attempts: int = 60) -> List[str]:
        """Poll job status until it's finished."""
        logger.info(f"Polling job {job_id} for completion...")
        for attempt in range(max_attempts):
            job_data = self._make_request("GET", f"jobs/{job_id}")
            job_info = job_data.get("job", {})
            status = job_info.get("status", "")

            if status == "success":
                logger.info("✅ Job completed successfully!")
                return self._extract_image_urls(job_data)
            elif status == "failure":
                raise ScenarioAPIError(f"Job failed: {job_info.get('error', 'Unknown error')}")

            time.sleep(3 if attempt < 10 else 5)

        raise ScenarioAPIError("Job polling timeout (no success after 5 minutes)")

    def _extract_image_urls(self, job_data: Dict) -> List[str]:
        """Extract image URLs from job response."""
        urls = []
        job_info = job_data.get("job", {})
        images = job_info.get("images", []) or job_info.get("urls", [])

        if images:
            return [img if isinstance(img, str) else img.get("url", "") for img in images]

        # Fallback — fetch by asset IDs if needed
        asset_ids = job_info.get("metadata", {}).get("assetIds", [])
        for asset_id in asset_ids:
            asset_data = self._make_request("GET", f"assets/{asset_id}")
            if url := asset_data.get("asset", {}).get("url"):
                urls.append(url)

        return urls


# Example usage
if __name__ == "__main__":
    full_prompt = """Generate six cohesive rank icons for a gamified to-do list app with a frog evolution theme. 
Show a clear progression from small and cute to majestic and mythical, each stage more detailed and powerful than the last. 
Keep the tone light, fun, and rewarding. Maintain consistent proportions, framing, and circular badge design.

Style: Vibrant, cartoonish, slightly chibi. 
Mood: Motivational and achievement-focused. 
Lighting: Soft glow and radiant highlights. 
Shape: Round emblem-style icons with bold outlines and layered depth. 
Color palette evolves from bright greens to royal golds and mystical purples.

(left) Young Toad – small happy frog on grass; 
(center-left) Pond Hopper – cheerful frog mid-jump with green hearts; 
(center) Lily Pad Master – proud frog on a lotus pad with flowers; 
(center-right) Swamp Lord – regal frog with crown and fireflies; 
(right) Toad King – royal frog in a cape on a glowing lily pad; 
(far right) Ancient Toad – glowing rune-covered frog surrounded by magical energy. 
Style: vibrant, cartoonish, chibi, consistent proportions, round badge aestheti
"""

    try:
        client = FrogEvolutionGenerator()
        urls = client.generate_frog_evolution(prompt=full_prompt)
        print("\n✅ Generated Frog Evolution Image(s):")
        for u in urls:
            print("🖼️ ", u)
    except Exception as e:
        print(f"❌ Error: {e}")

        import requests
from pathlib import Path

output_dir = Path("frog_images")
output_dir.mkdir(exist_ok=True)

for i, url in enumerate(urls):
    r = requests.get(url)
    file_path = output_dir / f"frog_evolution_{i+1}.png"
    with open(file_path, "wb") as f:
        f.write(r.content)
    print(f"✅ Saved image: {file_path}")
