# Pokémon Visual Recognition App - Technical Specification

## Executive Summary

A web and mobile application that allows users to photograph objects and identify which Pokémon they most closely resemble using computer vision. The system leverages OpenAI's CLIP model for visual similarity matching against a pre-computed database of all Pokémon (~1,025 total).

**Key Decisions:**
- Vision Model: OpenAI CLIP (openai/clip-vit-base-patch32)
- Coverage: All Pokémon generations (~1,025 Pokémon)
- Authentication: Anonymous usage for prototype
- Matching: Always return top 5 matches (configurable to 10)
- Monetization: None for prototype phase

---

## 1. Customer Requirements

### Core User Stories

1. **US-001**: As a user, I want to take a photo using my device camera so I can identify which Pokémon it resembles
2. **US-002**: As a user, I want to upload an existing photo from my device so I can identify which Pokémon it resembles
3. **US-003**: As a user, I want to see the top matching Pokémon with confidence scores so I can understand how similar my photo is to different Pokémon
4. **US-004**: As a user, I want to see details about the matched Pokémon (name, type, description) so I can learn more about it
5. **US-005**: As a user, I want a responsive web interface that works on mobile browsers so I can use it immediately without installing an app
6. **US-006**: As a user, I want a native iOS app eventually so I can have a better mobile experience with camera integration

### Success Criteria

- Photo capture/upload completes within 2 seconds
- Vision model analysis completes within 5 seconds total (2-3s embedding extraction + <1s similarity search)
- Match accuracy feels intuitive to users (subjective validation through user testing)
- Works on modern browsers (Chrome, Safari, Firefox - last 2 versions)
- iOS app supports iPhone models from iPhone 12 onwards (iOS 15+)
- Handles at least 100 concurrent users

---

## 2. Non-Functional Requirements

### Performance
- **Response Time**: Complete analysis (embedding extraction + matching) < 5s
- **Concurrent Users**: Support 100 concurrent users initially
- **Image Size**: Accept images up to 10MB, resize to optimal dimensions (224x224 for CLIP)
- **Caching**: Cache Pokémon embeddings in memory/database to avoid recomputation
- **Model Inference**: CLIP inference ~500ms on CPU, ~50ms on GPU

### Security
- **Input Validation**: Validate uploaded files are valid images (JPEG, PNG, WebP)
- **File Size Limits**: Maximum 10MB per upload
- **Rate Limiting**: Maximum 10 requests per IP address per minute
- **Data Privacy**: Do not persist user-uploaded images beyond request lifecycle
- **API Keys**: Secure storage of any API keys via environment variables
- **CORS**: Properly configured CORS for web client access

### Scalability
- **Stateless Backend**: Design API to be horizontally scalable (no session state on server)
- **CDN**: Serve static Pokémon images and data via CDN
- **Database**: PostgreSQL with pgvector for efficient embedding similarity search
- **Connection Pooling**: Efficient database connection management

### Reliability
- **Error Handling**: Graceful degradation if model inference fails
- **Logging**: Structured logging with request IDs, timing information, and error context
- **Monitoring**: Health check endpoints, error rate tracking, latency monitoring
- **Retry Logic**: Client-side retry for transient network failures

### Maintainability
- **Testing**: Comprehensive unit tests (TDD approach), integration tests for API endpoints
- **Documentation**: OpenAPI/Swagger docs, setup instructions, deployment guides
- **Type Safety**: Python type hints throughout, TypeScript for frontend
- **Code Quality**: Linting (ruff/black for Python, ESLint for TypeScript)

### Accessibility
- **WCAG 2.1 AA Compliance**: Keyboard navigation, screen reader support, color contrast
- **Responsive Design**: Works on screen sizes from 320px (mobile) to 4K displays
- **Progressive Enhancement**: Core functionality works without JavaScript where possible

---

## 3. Domain Model

### Core Entities

```python
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

@dataclass
class Pokemon:
    """Represents a Pokémon from the Pokédex"""
    id: int  # National Dex number (1-1025)
    name: str
    types: List[str]  # e.g., ["fire", "flying"]
    description: str  # Flavor text from Pokédex
    image_url: str  # Official artwork URL
    generation: int  # 1-9
    height: float  # In meters
    weight: float  # In kilograms
    abilities: List[str]
    stats: PokemonStats
    embedding: Optional[List[float]] = None  # 512-dim CLIP embedding

@dataclass
class PokemonStats:
    """Pokémon base stats"""
    hp: int
    attack: int
    defense: int
    special_attack: int
    special_defense: int
    speed: int

@dataclass
class UserImage:
    """User-submitted image for analysis"""
    id: str  # UUID
    image_data: bytes
    mime_type: str  # image/jpeg, image/png, image/webp
    uploaded_at: datetime
    file_size_bytes: int
    
@dataclass
class MatchResult:
    """Result of comparing user image to a Pokémon"""
    pokemon: Pokemon
    similarity_score: float  # 0.0 to 1.0 (cosine similarity)
    rank: int  # 1 for best match, 2 for second, etc.
    
@dataclass
class AnalysisResult:
    """Complete analysis of user image"""
    id: str  # UUID, correlates to request
    user_image_embedding: List[float]  # 512-dim vector
    matches: List[MatchResult]  # Top N matches, sorted by score descending
    processing_time_ms: int
    model_version: str  # "openai/clip-vit-base-patch32"
    created_at: datetime
```

### Domain Services

```python
class ImageProcessor:
    """Handles image validation, preprocessing, and embedding extraction"""
    
    def validate_image(self, image_data: bytes, mime_type: str) -> bool:
        """Validate image format and size"""
        ...
    
    def resize_image(self, image_data: bytes, target_size: int = 224) -> bytes:
        """Resize image to optimal dimensions for CLIP (224x224)"""
        ...
    
    def extract_embedding(self, image_data: bytes) -> List[float]:
        """Extract 512-dimensional embedding using CLIP model"""
        ...

class PokemonMatcher:
    """Matches user image embeddings to Pokémon embeddings"""
    
    def find_best_matches(
        self, 
        user_embedding: List[float], 
        top_n: int = 5
    ) -> List[MatchResult]:
        """Find top N most similar Pokémon using cosine similarity"""
        ...
    
    def calculate_similarity(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        """Calculate cosine similarity between two embeddings"""
        ...

class PokedexRepository:
    """Retrieves Pokémon data and embeddings from database/API"""
    
    async def get_all_pokemon(self) -> List[Pokemon]:
        """Fetch all Pokémon from PokéAPI and cache locally"""
        ...
    
    async def get_pokemon_by_id(self, id: int) -> Optional[Pokemon]:
        """Get specific Pokémon by National Dex number"""
        ...
    
    async def get_pokemon_embeddings(self) -> Dict[int, List[float]]:
        """Retrieve all pre-computed Pokémon embeddings"""
        ...
    
    async def save_pokemon_embedding(
        self, 
        pokemon_id: int, 
        embedding: List[float],
        model_version: str
    ) -> None:
        """Store pre-computed embedding in database"""
        ...
```

---

## 4. Technical Architecture

### Technology Stack

#### Backend: **Python 3.11+ with FastAPI**

**Dependencies:**
```toml
# pyproject.toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
python-multipart = "^0.0.6"  # For file uploads
httpx = "^0.26.0"  # For PokéAPI requests
torch = "^2.1.0"
transformers = "^4.36.0"  # For CLIP model
pillow = "^10.2.0"  # Image processing
asyncpg = "^0.29.0"  # PostgreSQL async driver
sqlalchemy = {extras = ["asyncio"], version = "^2.0.25"}
pgvector = "^0.2.4"  # Vector similarity search
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
python-jose = "^3.3.0"  # For request IDs
```

**Rationale:**
- FastAPI: High performance, automatic OpenAPI docs, async support, type safety
- Rich Python ecosystem for ML (transformers, torch)
- Excellent support for type hints (aligns with TDD approach)
- Easy deployment (Docker, serverless options available)

#### Vision Model: **OpenAI CLIP (clip-vit-base-patch32)**

**Model Details:**
- Architecture: Vision Transformer (ViT) with 12 layers
- Embedding Dimension: 512 (vs 1536 for text-embedding-3-small)
- Input Size: 224x224 pixels
- Parameters: ~151M
- License: MIT (open source)
- Performance: ~500ms inference on CPU, ~50ms on GPU

**Rationale:**
- Designed specifically for image similarity and zero-shot classification
- No API costs (self-hosted)
- Fast inference with reasonable resource requirements
- Proven performance on diverse image types
- Same underlying technology as GPT-4 Vision

#### Database: **PostgreSQL 15+ with pgvector extension**

**Schema:**
```sql
-- Pokémon metadata and embeddings
CREATE TABLE pokemon (
    id INTEGER PRIMARY KEY,  -- National Dex number
    name VARCHAR(100) NOT NULL,
    types TEXT[] NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    generation INTEGER NOT NULL,
    height REAL,
    weight REAL,
    abilities TEXT[],
    hp INTEGER,
    attack INTEGER,
    defense INTEGER,
    special_attack INTEGER,
    special_defense INTEGER,
    speed INTEGER,
    embedding vector(512),  -- CLIP embedding
    model_version VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX ON pokemon USING ivfflat (embedding vector_cosine_ops);

-- Optional: Request logging for analytics
CREATE TABLE analysis_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET,
    user_agent TEXT,
    processing_time_ms INTEGER,
    top_match_id INTEGER REFERENCES pokemon(id),
    top_match_score REAL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Rationale:**
- pgvector enables efficient cosine similarity search on embeddings
- Mature, reliable, excellent Python support (asyncpg, SQLAlchemy)
- Can handle 1,025 vectors easily with minimal latency (<10ms for similarity search)
- Free and open source

#### Frontend (Web): **React 18+ with TypeScript + Vite**

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.17.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "@testing-library/react": "^14.1.0",
    "vitest": "^1.1.0"
  }
}
```

**UI Framework:** Tailwind CSS for responsive, utility-first styling

**Rationale:**
- React: Most popular framework, excellent ecosystem, easy to convert to React Native
- TypeScript: Type safety, better developer experience, fewer runtime errors
- Vite: Extremely fast development server and optimized production builds
- React Query: Excellent data fetching, caching, and state management
- Easy path to iOS app via React Native

#### Mobile (iOS): **React Native with Expo**

**Future Phase (Phase 3):**
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-camera": "~14.0.0",
    "expo-image-picker": "~14.7.0",
    "react-native": "0.73.0"
  }
}
```

**Rationale:**
- Code reuse from web React components
- Expo provides simplified native camera access and build process
- Faster development than native Swift
- Can eject to bare React Native if needed for advanced features

#### Data Source: **PokéAPI (pokeapi.co)**

**Endpoints Used:**
- `GET /api/v2/pokemon?limit=10000` - List all Pokémon
- `GET /api/v2/pokemon/{id}` - Individual Pokémon details
- `GET /api/v2/pokemon-species/{id}` - Flavor text and descriptions

**Rationale:**
- Free, comprehensive RESTful API
- All Pokémon data through Generation 9
- High-quality official artwork URLs
- Well-documented, stable, widely used

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Client                              │
│                  (React + TypeScript + Vite)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Camera/File Upload UI (MediaDevices API)             │   │
│  │  - Image Preview & Crop                                 │   │
│  │  - Match Results Display (Cards with scores)            │   │
│  │  - Pokémon Details View (Stats, description)            │   │
│  │  - Loading States & Error Handling                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS / REST API
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Gateway / Reverse Proxy (nginx)                │
│  - Rate Limiting (10 req/min per IP)                            │
│  - CORS Configuration                                           │
│  - Static File Serving (Pokémon images)                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/v1/analyze                                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ 1. Validate image (format, size)                   │  │  │
│  │  │ 2. Preprocess image (resize to 224x224)            │  │  │
│  │  │ 3. Extract embedding via CLIP (512-dim vector)     │  │  │
│  │  │ 4. Query pgvector for top N similar embeddings    │  │  │
│  │  │ 5. Enrich results with Pokémon metadata           │  │  │
│  │  │ 6. Return AnalysisResult                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GET /api/v1/pokemon/{id}                                │  │
│  │  - Return detailed Pokémon information                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GET /api/v1/health                                      │  │
│  │  - Health check (DB connection, model loaded)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Components:                                                    │
│  - ImageProcessor (CLIP model wrapper)                          │
│  - PokemonMatcher (cosine similarity)                           │
│  - PokedexRepository (DB/API access)                            │
└────┬────────────────────────┬───────────────────────────────────┘
     │                        │
     │                        └──────────────────┐
     ▼                                           ▼
┌─────────────────────────┐        ┌────────────────────────────┐
│  CLIP Model (in-memory) │        │  PostgreSQL + pgvector     │
│  - openai/clip-vit-     │        │  ┌──────────────────────┐  │
│    base-patch32         │        │  │  pokemon table       │  │
│  - Loaded on startup    │        │  │  - id, name, types   │  │
│  - ~600MB RAM           │        │  │  - embedding (512d)  │  │
│  - CPU inference OK     │        │  │  - metadata          │  │
└─────────────────────────┘        │  └──────────────────────┘  │
                                   │  - IVFFlat index for     │
                                   │    fast similarity search│
                                   └────────────────────────────┘
                                   
┌─────────────────────────┐
│  PokéAPI (External)     │
│  - Used during setup    │
│  - Cached in database   │
└─────────────────────────┘
```

---

## 5. API Specification

### Base URL
- Development: `http://localhost:8000`
- Production: `https://api.pokerotom.com` (example)

### Authentication
- None required (anonymous usage)
- Rate limiting by IP address

### Common Headers
```
Content-Type: multipart/form-data (for uploads)
Content-Type: application/json (for responses)
```

### Endpoints

#### POST /api/v1/analyze

Analyze an uploaded image and return matching Pokémon.

**Request:**
```http
POST /api/v1/analyze HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

[Binary image data]
------WebKitFormBoundary
Content-Disposition: form-data; name="top_n"

5
------WebKitFormBoundary--
```

**Parameters:**
- `image` (required): Image file (JPEG, PNG, WebP)
  - Max size: 10MB
  - Recommended: < 2MB for faster upload
- `top_n` (optional): Number of matches to return
  - Type: integer
  - Default: 5
  - Min: 1, Max: 10

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "matches": [
    {
      "pokemon": {
        "id": 6,
        "name": "Charizard",
        "types": ["fire", "flying"],
        "description": "Spits fire that is hot enough to melt boulders...",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
        "generation": 1
      },
      "similarity_score": 0.847,
      "rank": 1
    },
    {
      "pokemon": {
        "id": 149,
        "name": "Dragonite",
        "types": ["dragon", "flying"],
        "description": "An extremely rarely seen marine Pokémon...",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
        "generation": 1
      },
      "similarity_score": 0.792,
      "rank": 2
    }
    // ... 3 more matches
  ],
  "processing_time_ms": 1247,
  "model_version": "openai/clip-vit-base-patch32",
  "created_at": "2025-11-15T10:30:45.123Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid image
{
  "error": "invalid_image",
  "message": "Uploaded file is not a valid image format. Supported: JPEG, PNG, WebP",
  "details": {
    "mime_type": "application/pdf",
    "max_size_mb": 10
  }
}

// 413 Payload Too Large
{
  "error": "file_too_large",
  "message": "Image size exceeds 10MB limit",
  "details": {
    "size_mb": 15.3,
    "max_size_mb": 10
  }
}

// 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Maximum 10 requests per minute.",
  "details": {
    "retry_after_seconds": 42
  }
}

// 500 Internal Server Error
{
  "error": "processing_failed",
  "message": "Failed to process image",
  "details": {
    "error_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}

// 503 Service Unavailable
{
  "error": "service_unavailable",
  "message": "Service is temporarily unavailable",
  "details": {
    "reason": "model_loading"
  }
}
```

#### GET /api/v1/pokemon/{id}

Get detailed information about a specific Pokémon.

**Request:**
```http
GET /api/v1/pokemon/25 HTTP/1.1
```

**Path Parameters:**
- `id` (required): National Pokédex number (1-1025)

**Response (200 OK):**
```json
{
  "id": 25,
  "name": "Pikachu",
  "types": ["electric"],
  "description": "When several of these Pokémon gather, their electricity could build and cause lightning storms.",
  "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  "generation": 1,
  "height": 0.4,
  "weight": 6.0,
  "abilities": ["Static", "Lightning Rod"],
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "special_attack": 50,
    "special_defense": 50,
    "speed": 90
  }
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "error": "pokemon_not_found",
  "message": "Pokémon with ID 9999 does not exist",
  "details": {
    "max_id": 1025
  }
}
```

#### GET /api/v1/health

Health check endpoint for monitoring.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T10:30:45.123Z",
  "checks": {
    "database": "connected",
    "model": "loaded",
    "pokemon_count": 1025
  },
  "version": "1.0.0"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-11-15T10:30:45.123Z",
  "checks": {
    "database": "error",
    "model": "not_loaded",
    "pokemon_count": 0
  },
  "version": "1.0.0"
}
```

---

## 6. Development Approach (London-Style TDD)

### Phase 1: Core Backend (Weeks 1-2)

#### Test Structure

```
tests/
├── unit/
│   ├── test_image_processor.py
│   ├── test_pokemon_matcher.py
│   ├── test_pokedex_repository.py
│   └── test_validators.py
├── integration/
│   ├── test_api_endpoints.py
│   ├── test_database.py
│   └── test_end_to_end.py
└── fixtures/
    ├── sample_images/
    └── mock_data.py
```

#### TDD Workflow (Red-Green-Refactor)

**1. ImageProcessor Tests (Mock CLIP model)**

```python
# tests/unit/test_image_processor.py
import pytest
from unittest.mock import Mock, patch
from PIL import Image
import io

class TestImageProcessor:
    
    def test_validate_image_accepts_valid_jpeg(self):
        """Should accept valid JPEG images"""
        processor = ImageProcessor()
        
        # Create mock JPEG image
        img = Image.new('RGB', (100, 100))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        result = processor.validate_image(
            img_bytes.getvalue(), 
            'image/jpeg'
        )
        
        assert result is True
    
    def test_validate_image_rejects_oversized_file(self):
        """Should reject images over 10MB"""
        processor = ImageProcessor()
        
        # Create 11MB of random data
        large_data = b'0' * (11 * 1024 * 1024)
        
        with pytest.raises(ValueError, match="exceeds 10MB"):
            processor.validate_image(large_data, 'image/jpeg')
    
    def test_validate_image_rejects_invalid_format(self):
        """Should reject non-image files"""
        processor = ImageProcessor()
        
        with pytest.raises(ValueError, match="Invalid image format"):
            processor.validate_image(b'not an image', 'application/pdf')
    
    def test_resize_image_maintains_aspect_ratio(self):
        """Should resize to 224x224 while maintaining aspect ratio"""
        processor = ImageProcessor()
        
        # Create 800x600 image
        img = Image.new('RGB', (800, 600))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        resized = processor.resize_image(img_bytes.getvalue())
        result_img = Image.open(io.BytesIO(resized))
        
        assert result_img.size == (224, 224)
    
    @patch('image_processor.CLIPModel')
    @patch('image_processor.CLIPProcessor')
    def test_extract_embedding_returns_512_dim_vector(
        self, 
        mock_processor, 
        mock_model
    ):
        """Should extract 512-dimensional embedding from image"""
        # Mock CLIP model to return fake embedding
        mock_model_instance = Mock()
        mock_model.from_pretrained.return_value = mock_model_instance
        
        fake_embedding = torch.randn(1, 512)
        mock_model_instance.get_image_features.return_value = fake_embedding
        
        processor = ImageProcessor()
        
        img = Image.new('RGB', (224, 224))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        embedding = processor.extract_embedding(img_bytes.getvalue())
        
        assert len(embedding) == 512
        assert all(isinstance(x, float) for x in embedding)
    
    @patch('image_processor.CLIPModel')
    def test_extract_embedding_normalizes_vectors(self, mock_model):
        """Should normalize embedding vectors to unit length"""
        mock_model_instance = Mock()
        mock_model.from_pretrained.return_value = mock_model_instance
        
        # Create unnormalized embedding
        fake_embedding = torch.tensor([[1.0] * 512])
        mock_model_instance.get_image_features.return_value = fake_embedding
        
        processor = ImageProcessor()
        
        img = Image.new('RGB', (224, 224))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        embedding = processor.extract_embedding(img_bytes.getvalue())
        
        # Check if normalized (L2 norm should be ~1.0)
        import numpy as np
        norm = np.linalg.norm(embedding)
        assert abs(norm - 1.0) < 0.01
```

**2. PokemonMatcher Tests (Mock embeddings)**

```python
# tests/unit/test_pokemon_matcher.py
import pytest
import numpy as np

class TestPokemonMatcher:
    
    def test_calculate_similarity_returns_cosine_similarity(self):
        """Should calculate cosine similarity between embeddings"""
        matcher = PokemonMatcher()
        
        # Identical vectors should have similarity = 1.0
        vec1 = [1.0] * 512
        vec2 = [1.0] * 512
        
        similarity = matcher.calculate_similarity(vec1, vec2)
        
        assert abs(similarity - 1.0) < 0.01
    
    def test_calculate_similarity_orthogonal_vectors(self):
        """Should return 0 for orthogonal vectors"""
        matcher = PokemonMatcher()
        
        # Create orthogonal vectors
        vec1 = [1.0] + [0.0] * 511
        vec2 = [0.0, 1.0] + [0.0] * 510
        
        similarity = matcher.calculate_similarity(vec1, vec2)
        
        assert abs(similarity) < 0.01
    
    @pytest.mark.asyncio
    async def test_find_best_matches_returns_top_n(self, mock_db):
        """Should return top N most similar Pokémon"""
        # Setup: Create mock Pokémon with embeddings
        mock_pokemon = [
            Pokemon(id=1, name="Bulbasaur", embedding=[0.8] * 512),
            Pokemon(id=4, name="Charmander", embedding=[0.9] * 512),
            Pokemon(id=7, name="Squirtle", embedding=[0.7] * 512),
            Pokemon(id=25, name="Pikachu", embedding=[0.6] * 512),
        ]
        
        mock_db.get_all_pokemon_with_embeddings.return_value = mock_pokemon
        
        matcher = PokemonMatcher(mock_db)
        user_embedding = [0.85] * 512  # Closest to Charmander
        
        results = await matcher.find_best_matches(user_embedding, top_n=3)
        
        assert len(results) == 3
        assert results[0].pokemon.name == "Charmander"
        assert results[0].rank == 1
        assert results[1].rank == 2
        assert results[2].rank == 3
    
    def test_matches_sorted_by_score_descending(self):
        """Should sort matches by similarity score in descending order"""
        matcher = PokemonMatcher()
        
        # Create mock matches with different scores
        matches = [
            MatchResult(pokemon=Pokemon(id=1, name="A"), similarity_score=0.7, rank=0),
            MatchResult(pokemon=Pokemon(id=2, name="B"), similarity_score=0.9, rank=0),
            MatchResult(pokemon=Pokemon(id=3, name="C"), similarity_score=0.8, rank=0),
        ]
        
        sorted_matches = matcher._sort_and_rank(matches)
        
        assert sorted_matches[0].similarity_score == 0.9
        assert sorted_matches[1].similarity_score == 0.8
        assert sorted_matches[2].similarity_score == 0.7
        assert [m.rank for m in sorted_matches] == [1, 2, 3]
```

**3. PokedexRepository Tests (Mock PokéAPI)**

```python
# tests/unit/test_pokedex_repository.py
import pytest
from unittest.mock import Mock, AsyncMock, patch

class TestPokedexRepository:
    
    @pytest.mark.asyncio
    async def test_get_all_pokemon_fetches_from_api(self):
        """Should fetch all Pokémon from PokéAPI"""
        mock_http_client = AsyncMock()
        mock_http_client.get.return_value.json.return_value = {
            "results": [
                {"name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/"},
                {"name": "charmander", "url": "https://pokeapi.co/api/v2/pokemon/4/"}
            ]
        }
        
        repo = PokedexRepository(http_client=mock_http_client)
        pokemon_list = await repo.get_all_pokemon()
        
        assert len(pokemon_list) == 2
        assert pokemon_list[0].name == "Bulbasaur"
        mock_http_client.get.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_pokemon_by_id_returns_correct_pokemon(self):
        """Should fetch specific Pokémon by ID"""
        mock_http_client = AsyncMock()
        mock_response = {
            "id": 25,
            "name": "pikachu",
            "types": [{"type": {"name": "electric"}}],
            "height": 4,
            "weight": 60,
        }
        mock_http_client.get.return_value.json.return_value = mock_response
        
        repo = PokedexRepository(http_client=mock_http_client)
        pokemon = await repo.get_pokemon_by_id(25)
        
        assert pokemon.id == 25
        assert pokemon.name == "Pikachu"
        assert pokemon.types == ["electric"]
    
    @pytest.mark.asyncio
    async def test_get_pokemon_embeddings_caches_results(self):
        """Should cache embeddings to avoid repeated DB queries"""
        mock_db = AsyncMock()
        mock_db.fetch_all_embeddings.return_value = [
            (1, [0.1] * 512),
            (4, [0.2] * 512),
        ]
        
        repo = PokedexRepository(db=mock_db)
        
        # First call
        embeddings1 = await repo.get_pokemon_embeddings()
        # Second call
        embeddings2 = await repo.get_pokemon_embeddings()
        
        # Should only query DB once
        mock_db.fetch_all_embeddings.assert_called_once()
        assert embeddings1 == embeddings2
    
    @pytest.mark.asyncio
    async def test_save_pokemon_embedding_stores_in_db(self):
        """Should save embedding to database"""
        mock_db = AsyncMock()
        repo = PokedexRepository(db=mock_db)
        
        embedding = [0.5] * 512
        await repo.save_pokemon_embedding(
            pokemon_id=25,
            embedding=embedding,
            model_version="openai/clip-vit-base-patch32"
        )
        
        mock_db.execute.assert_called_once()
        call_args = mock_db.execute.call_args[0][0]
        assert "UPDATE pokemon SET embedding" in call_args
```

**4. API Endpoint Integration Tests**

```python
# tests/integration/test_api_endpoints.py
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io

class TestAnalyzeEndpoint:
    
    def test_analyze_accepts_valid_image_upload(self, client: TestClient):
        """Should accept valid JPEG upload and return 200"""
        # Create test image
        img = Image.new('RGB', (224, 224), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = client.post(
            "/api/v1/analyze",
            files={"image": ("test.jpg", img_bytes, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "matches" in data
        assert len(data["matches"]) == 5  # Default top_n
    
    def test_analyze_returns_correct_structure(self, client: TestClient):
        """Should return AnalysisResult with correct schema"""
        img = Image.new('RGB', (224, 224))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = client.post(
            "/api/v1/analyze",
            files={"image": ("test.jpg", img_bytes, "image/jpeg")},
            data={"top_n": 3}
        )
        
        data = response.json()
        
        # Validate structure
        assert "matches" in data
        assert len(data["matches"]) == 3
        
        match = data["matches"][0]
        assert "pokemon" in match
        assert "similarity_score" in match
        assert "rank" in match
        assert match["rank"] == 1
        
        pokemon = match["pokemon"]
        assert all(k in pokemon for k in ["id", "name", "types", "image_url"])
    
    def test_analyze_rejects_invalid_image_format(self, client: TestClient):
        """Should return 400 for non-image files"""
        response = client.post(
            "/api/v1/analyze",
            files={"image": ("test.txt", b"not an image", "text/plain")}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "invalid_image"
    
    def test_analyze_rejects_oversized_file(self, client: TestClient):
        """Should return 413 for files over 10MB"""
        # Create 11MB file
        large_data = b'0' * (11 * 1024 * 1024)
        
        response = client.post(
            "/api/v1/analyze",
            files={"image": ("large.jpg", large_data, "image/jpeg")}
        )
        
        assert response.status_code == 413
        data = response.json()
        assert data["error"] == "file_too_large"
    
    def test_rate_limiting_enforced(self, client: TestClient):
        """Should enforce rate limit of 10 requests per minute"""
        img = Image.new('RGB', (100, 100))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        # Make 11 requests rapidly
        for i in range(11):
            img_bytes.seek(0)
            response = client.post(
                "/api/v1/analyze",
                files={"image": (f"test{i}.jpg", img_bytes, "image/jpeg")}
            )
            
            if i < 10:
                assert response.status_code == 200
            else:
                assert response.status_code == 429
                data = response.json()
                assert data["error"] == "rate_limit_exceeded"
    
    def test_analyze_respects_top_n_parameter(self, client: TestClient):
        """Should return requested number of matches"""
        img = Image.new('RGB', (224, 224))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = client.post(
            "/api/v1/analyze",
            files={"image": ("test.jpg", img_bytes, "image/jpeg")},
            data={"top_n": 10}
        )
        
        data = response.json()
        assert len(data["matches"]) == 10

class TestPokemonEndpoint:
    
    def test_get_pokemon_returns_correct_data(self, client: TestClient):
        """Should return Pokémon details for valid ID"""
        response = client.get("/api/v1/pokemon/25")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == 25
        assert data["name"] == "Pikachu"
        assert "electric" in data["types"]
        assert "stats" in data
    
    def test_get_pokemon_returns_404_for_invalid_id(self, client: TestClient):
        """Should return 404 for non-existent Pokémon"""
        response = client.get("/api/v1/pokemon/9999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "pokemon_not_found"

class TestHealthEndpoint:
    
    def test_health_check_returns_status(self, client: TestClient):
        """Should return health status"""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "checks" in data
        assert data["checks"]["database"] == "connected"
        assert data["checks"]["model"] == "loaded"
```

### Phase 2: Frontend Web App (Weeks 3-4)

#### Component Test Examples

```typescript
// tests/components/CameraCapture.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { CameraCapture } from '@/components/CameraCapture';

describe('CameraCapture', () => {
  test('renders camera permission prompt on mount', () => {
    render(<CameraCapture onImageCapture={vi.fn()} />);
    
    expect(screen.getByText(/camera access/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable camera/i })).toBeInTheDocument();
  });
  
  test('captures image when button clicked', async () => {
    const onImageCapture = vi.fn();
    
    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => []
      })
    };
    
    render(<CameraCapture onImageCapture={onImageCapture} />);
    
    const enableButton = screen.getByRole('button', { name: /enable camera/i });
    fireEvent.click(enableButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
    });
    
    const captureButton = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(captureButton);
    
    await waitFor(() => {
      expect(onImageCapture).toHaveBeenCalled();
    });
  });
  
  test('displays preview of captured image', async () => {
    render(<CameraCapture onImageCapture={vi.fn()} />);
    
    // Simulate image capture
    // ... test implementation
    
    await waitFor(() => {
      const preview = screen.getByRole('img', { name: /preview/i });
      expect(preview).toBeInTheDocument();
    });
  });
});

// tests/components/MatchResults.test.tsx
describe('MatchResults', () => {
  const mockMatches = [
    {
      pokemon: {
        id: 6,
        name: 'Charizard',
        types: ['fire', 'flying'],
        image_url: 'https://example.com/6.png'
      },
      similarity_score: 0.92,
      rank: 1
    },
    {
      pokemon: {
        id: 149,
        name: 'Dragonite',
        types: ['dragon', 'flying'],
        image_url: 'https://example.com/149.png'
      },
      similarity_score: 0.85,
      rank: 2
    }
  ];
  
  test('displays loading state during analysis', () => {
    render(<MatchResults isLoading={true} matches={[]} />);
    
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('renders matches with similarity scores', () => {
    render(<MatchResults isLoading={false} matches={mockMatches} />);
    
    expect(screen.getByText('Charizard')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Dragonite')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
  
  test('matches sorted by similarity score', () => {
    render(<MatchResults isLoading={false} matches={mockMatches} />);
    
    const matchCards = screen.getAllByTestId('match-card');
    expect(matchCards[0]).toHaveTextContent('Charizard');
    expect(matchCards[1]).toHaveTextContent('Dragonite');
  });
  
  test('clicking match navigates to detail view', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }));
    
    render(<MatchResults isLoading={false} matches={mockMatches} />);
    
    const firstMatch = screen.getByText('Charizard').closest('div');
    fireEvent.click(firstMatch!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/pokemon/6');
  });
});
```

### Phase 3: iOS App (Weeks 5-6)

React Native testing examples omitted for brevity, but would follow similar patterns using React Native Testing Library.

---

## 7. Data Pre-computation Strategy

### Embedding Generation Script

```python
# scripts/precompute_embeddings.py
"""
Pre-compute CLIP embeddings for all Pokémon artwork.
Run this during deployment or when the model version changes.
"""

import asyncio
import httpx
from tqdm import tqdm
from PIL import Image
import io
from typing import List

from app.services.image_processor import ImageProcessor
from app.repositories.pokedex_repository import PokedexRepository
from app.database import get_db_connection

async def download_pokemon_image(url: str) -> bytes:
    """Download Pokémon official artwork"""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content

async def precompute_all_embeddings():
    """Main function to pre-compute all Pokémon embeddings"""
    
    print("🔧 Initializing...")
    
    # Initialize services
    image_processor = ImageProcessor()
    pokedex_repo = PokedexRepository()
    db = await get_db_connection()
    
    print("📡 Fetching Pokémon data from PokéAPI...")
    pokemon_list = await pokedex_repo.get_all_pokemon()
    
    print(f"✅ Found {len(pokemon_list)} Pokémon")
    print("🎨 Computing embeddings...")
    
    successful = 0
    failed = []
    
    for pokemon in tqdm(pokemon_list, desc="Processing Pokémon"):
        try:
            # Download official artwork
            image_data = await download_pokemon_image(pokemon.image_url)
            
            # Extract CLIP embedding
            embedding = await image_processor.extract_embedding(image_data)
            
            # Save to database
            await pokedex_repo.save_pokemon_embedding(
                pokemon_id=pokemon.id,
                embedding=embedding,
                model_version="openai/clip-vit-base-patch32"
            )
            
            successful += 1
            
        except Exception as e:
            failed.append((pokemon.id, pokemon.name, str(e)))
            print(f"\n❌ Failed for {pokemon.name}: {e}")
    
    print(f"\n✅ Successfully processed {successful}/{len(pokemon_list)} Pokémon")
    
    if failed:
        print(f"\n⚠️  Failed embeddings ({len(failed)}):")
        for pid, name, error in failed:
            print(f"  - {name} (ID {pid}): {error}")
    
    await db.close()

if __name__ == "__main__":
    asyncio.run(precompute_all_embeddings())
```

### Embedding Storage and Retrieval

```sql
-- Create vector similarity search function
CREATE OR REPLACE FUNCTION find_similar_pokemon(
    query_embedding vector(512),
    match_count int DEFAULT 5
)
RETURNS TABLE (
    pokemon_id int,
    similarity_score float
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        id,
        1 - (embedding <=> query_embedding) AS similarity_score
    FROM pokemon
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
END;
$ LANGUAGE plpgsql;
```

```python
# app/repositories/pokedex_repository.py
async def find_similar_pokemon(
    self,
    embedding: List[float],
    top_n: int = 5
) -> List[Tuple[int, float]]:
    """Find most similar Pokémon using pgvector"""
    
    query = """
        SELECT pokemon_id, similarity_score
        FROM find_similar_pokemon($1::vector, $2)
    """
    
    rows = await self.db.fetch(query, embedding, top_n)
    
    return [(row['pokemon_id'], row['similarity_score']) for row in rows]
```

---

## 8. Deployment Architecture

### Environment Configuration

```bash
# .env.production
# Database
DATABASE_URL=postgresql://user:password@db.example.com:5432/pokedex
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# Image Processing
MAX_IMAGE_SIZE_MB=10
DEFAULT_TOP_N=5
MAX_TOP_N=10
CLIP_MODEL_NAME=openai/clip-vit-base-patch32

# External APIs
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
POKEAPI_CACHE_TTL_SECONDS=86400

# Monitoring
LOG_LEVEL=INFO
SENTRY_DSN=https://...  # Optional for error tracking

# CORS
ALLOWED_ORIGINS=https://pokerotom.com,https://www.pokerotom.com
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download CLIP model during build (cached in image)
RUN python -c "from transformers import CLIPModel, CLIPProcessor; \
    CLIPModel.from_pretrained('openai/clip-vit-base-patch32'); \
    CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')"

# Copy application code
COPY . .

# Run precompute script during build (optional, can be separate job)
# RUN python scripts/precompute_embeddings.py

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_USER: pokedex
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: pokedex
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  api:
    build: .
    environment:
      DATABASE_URL: postgresql://pokedex:${DB_PASSWORD}@db:5432/pokedex
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - ./app:/app/app  # Hot reload in development
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api

volumes:
  postgres_data:
```

### Deployment Checklist

**Backend Deployment:**
- [ ] Provision PostgreSQL database with pgvector extension
- [ ] Run database migrations
- [ ] Execute embedding pre-computation script (one-time)
- [ ] Deploy FastAPI application (Docker container or serverless)
- [ ] Configure environment variables
- [ ] Set up health check monitoring
- [ ] Configure rate limiting
- [ ] Enable CORS for frontend domain

**Frontend Deployment:**
- [ ] Build React app (`npm run build`)
- [ ] Deploy static files to CDN (Vercel/Netlify)
- [ ] Configure API endpoint environment variable
- [ ] Set up custom domain with SSL
- [ ] Configure caching headers

**Monitoring & Operations:**
- [ ] Set up application logs aggregation
- [ ] Configure error tracking (Sentry or similar)
- [ ] Set up uptime monitoring
- [ ] Create alerting for API errors and latency
- [ ] Set up database backup schedule

---

## 9. Cost Estimation (Monthly)

| Resource | Tier | Cost |
|----------|------|------|
| PostgreSQL (Managed) | Supabase/Neon Free or $25 tier | $0-25 |
| Backend Hosting | Railway/Render (512MB RAM, 1 CPU) | $0-10 |
| Frontend Hosting | Vercel/Netlify Free Tier | $0 |
| CDN/Bandwidth | Included in hosting | $0 |
| Domain Name | .com registration | $12/year (~$1/month) |
| **Total** | | **$1-36/month** |

**Notes:**
- CLIP model is open source (no API costs)
- Free tiers sufficient for prototype with <1000 users
- Scale-up costs: ~$100-200/month for 10K active users

---

## 10. Future Enhancements (Post-MVP)

### User Features
- User accounts with authentication
- Save analysis history
- Favorite Pokémon collections
- Share results on social media
- Multi-language support

### Technical Improvements
- GPU acceleration for faster inference
- Self-hosted model with optimization (ONNX, TensorRT)
- Progressive Web App (PWA) for offline support
- WebAssembly version of CLIP for client-side processing
- GraphQL API for more flexible queries

### Advanced Features
- Video capture and frame-by-frame analysis
- AR mode (overlay Pokémon on camera view)
- Batch upload for multiple images
- "Pokédex completion" tracker
- Custom Pokémon collections (fan art, regional variants)

---

## 11. Success Metrics

### Technical Metrics
- P50/P95/P99 latency for /analyze endpoint
- Model inference time
- Database query performance
- Error rate (< 1%)
- Uptime (> 99.5%)

### User Metrics
- Daily/Monthly active users
- Average matches per session
- Retention rate (7-day, 30-day)
- User satisfaction (post-analysis survey)
- Most frequently matched Pokémon

---

## Appendix A: Directory Structure

```
pokemon-vision-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration management
│   │   ├── database.py          # Database connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── pokemon.py       # Pokemon domain models
│   │   │   ├── analysis.py      # AnalysisResult models
│   │   │   └── api_models.py    # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── image_processor.py
│   │   │   ├── pokemon_matcher.py
│   │   │   └── validators.py
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   └── pokedex_repository.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── analyze.py
│   │   │   │   ├── pokemon.py
│   │   │   │   └── health.py
│   │   │   └── middleware/
│   │   │       ├── rate_limiter.py
│   │   │       └── error_handler.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── logging.py
│   ├── scripts/
│   │   ├── precompute_embeddings.py
│   │   ├── migrate_database.py
│   │   └── seed_pokemon_data.py
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_image_processor.py
│   │   │   ├── test_pokemon_matcher.py
│   │   │   └── test_pokedex_repository.py
│   │   ├── integration/
│   │   │   ├── test_api_endpoints.py
│   │   │   └── test_database.py
│   │   └── fixtures/
│   │       ├── sample_images/
│   │       └── mock_data.py
│   ├── alembic/               # Database migrations
│   │   └── versions/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── MatchResults.tsx
│   │   │   ├── PokemonCard.tsx
│   │   │   └── PokemonDetail.tsx
│   │   ├── hooks/
│   │   │   ├── useCamera.ts
│   │   │   └── useAnalyze.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── pokemon.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Results.tsx
│   │   │   └── PokemonDetails.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── tests/
│   │   └── components/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
├── mobile/ (iOS - Phase 3)
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   └── services/
│   ├── app.json
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── api-documentation.md
│   ├── deployment-guide.md
│   └── development-setup.md
│
└── README.md
```

---

## Appendix B: Key Technologies & Versions

```toml
# backend/pyproject.toml (Poetry)
[tool.poetry]
name = "pokemon-vision-api"
version = "1.0.0"
description = "Pokémon Visual Recognition API"
authors = ["Your Team"]
python = "^3.11"

[tool.poetry.dependencies]
fastapi = "^0.109.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
python-multipart = "^0.0.6"
httpx = "^0.26.0"
torch = "^2.1.0"
transformers = "^4.36.0"
pillow = "^10.2.0"
asyncpg = "^0.29.0"
sqlalchemy = {extras = ["asyncio"], version = "^2.0.25"}
pgvector = "^0.2.4"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
alembic = "^1.13.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
pytest-cov = "^4.1.0"
black = "^23.12.0"
ruff = "^0.1.0"
mypy = "^1.7.0"
httpx-mock = "^0.12.0"
```

```json
// frontend/package.json
{
  "name": "pokemon-vision-web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.17.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vitest": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

---

## Appendix C: Sample API Interactions

### Example 1: Full Analysis Flow

```bash
# 1. Upload image for analysis
curl -X POST http://localhost:8000/api/v1/analyze \
  -F "image=@/path/to/orange_lizard.jpg" \
  -F "top_n=3"

# Response:
{
  "id": "a7b3c9d1-e4f2-4a6b-8c9d-1e2f3a4b5c6d",
  "matches": [
    {
      "pokemon": {
        "id": 4,
        "name": "Charmander",
        "types": ["fire"],
        "description": "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
        "generation": 1
      },
      "similarity_score": 0.891,
      "rank": 1
    },
    {
      "pokemon": {
        "id": 6,
        "name": "Charizard",
        "types": ["fire", "flying"],
        "description": "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
        "generation": 1
      },
      "similarity_score": 0.847,
      "rank": 2
    },
    {
      "pokemon": {
        "id": 5,
        "name": "Charmeleon",
        "types": ["fire"],
        "description": "When it swings its burning tail, it elevates the temperature to unbearably high levels.",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png",
        "generation": 1
      },
      "similarity_score": 0.823,
      "rank": 3
    }
  ],
  "processing_time_ms": 1534,
  "model_version": "openai/clip-vit-base-patch32",
  "created_at": "2025-11-15T10:45:23.456Z"
}

# 2. Get detailed info on top match
curl http://localhost:8000/api/v1/pokemon/4

# Response:
{
  "id": 4,
  "name": "Charmander",
  "types": ["fire"],
  "description": "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
  "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
  "generation": 1,
  "height": 0.6,
  "weight": 8.5,
  "abilities": ["Blaze", "Solar Power"],
  "stats": {
    "hp": 39,
    "attack": 52,
    "defense": 43,
    "special_attack": 60,
    "special_defense": 50,
    "speed": 65
  }
}
```

### Example 2: Error Handling

```bash
# Invalid file type
curl -X POST http://localhost:8000/api/v1/analyze \
  -F "image=@document.pdf"

# Response: 400 Bad Request
{
  "error": "invalid_image",
  "message": "Uploaded file is not a valid image format. Supported: JPEG, PNG, WebP",
  "details": {
    "mime_type": "application/pdf",
    "max_size_mb": 10
  }
}

# Rate limit exceeded
# (After making 10 requests in quick succession)

# Response: 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Maximum 10 requests per minute.",
  "details": {
    "retry_after_seconds": 37
  }
}
```

---

## Appendix D: Implementation Timeline

### Week 1-2: Backend Foundation
- **Day 1-2**: Project setup, database schema, CLIP model integration
- **Day 3-4**: ImageProcessor implementation with tests
- **Day 5-6**: PokemonMatcher and embedding similarity search
- **Day 7-8**: PokedexRepository with PokéAPI integration
- **Day 9-10**: FastAPI endpoints and middleware
- **Day 11-12**: Pre-compute all Pokémon embeddings
- **Day 13-14**: Integration testing and bug fixes

### Week 3-4: Frontend Web App
- **Day 15-16**: React project setup, routing, basic layout
- **Day 17-18**: CameraCapture and ImageUpload components
- **Day 19-20**: API integration and state management
- **Day 21-22**: MatchResults and PokemonDetail components
- **Day 23-24**: Responsive design and UI polish
- **Day 25-26**: Frontend testing (components + integration)
- **Day 27-28**: Deployment and production testing

### Week 5-6: iOS App (Optional)
- **Day 29-30**: React Native/Expo setup
- **Day 31-32**: Native camera integration
- **Day 33-34**: Component migration from web
- **Day 35-36**: iOS-specific UI adjustments
- **Day 37-38**: Testing on physical devices
- **Day 39-40**: TestFlight deployment
- **Day 41-42**: App Store submission preparation

---

## Summary

This specification provides a complete blueprint for building a Pokémon visual recognition application using:

- **Backend**: Python + FastAPI + PostgreSQL + pgvector
- **Vision Model**: OpenAI CLIP (self-hosted, free)
- **Frontend**: React + TypeScript + Vite
- **Mobile**: React Native + Expo (future)
- **Deployment**: Docker containers, managed PostgreSQL, static hosting

**Key Features:**
- ✅ All 1,025 Pokémon supported
- ✅ Anonymous usage (no authentication required)
- ✅ Top N matches (default 5, max 10)
- ✅ Zero API costs for vision model
- ✅ London-style TDD approach
- ✅ Comprehensive test coverage
- ✅ Production-ready architecture
- ✅ Clear deployment strategy
- ✅ Cost-effective (~$1-36/month for prototype)

The specification is designed for an AI agent developer to implement systematically, following test-driven development principles and working backwards from customer requirements through domain modeling to implementation.