from app.utils.pokemon_images import choose_image_url, sprite_fallback_url
from app.utils.pokemon_images import local_image_path, local_image_url, persist_image_bytes


def test_choose_image_url_prefers_available_artwork():
    sprites = {
        "other": {"official-artwork": {"front_default": "https://example.com/official.png"}},
        "front_default": "https://example.com/front.png",
    }

    url = choose_image_url(sprites, species_id=25, pokemon_id=10268)

    assert url == "https://example.com/official.png"


def test_choose_image_url_falls_back_to_species_sprite():
    sprites = {"other": {"official-artwork": {"front_default": None}}}

    url = choose_image_url(sprites, species_id=25, pokemon_id=10268)

    assert url == sprite_fallback_url(25)


def test_persist_image_bytes_writes_to_expected_path(tmp_path):
    target = persist_image_bytes(b"data", 10, root=tmp_path)

    assert target == local_image_path(10, root=tmp_path)
    assert target.read_bytes() == b"data"
    assert local_image_url(10) == "/static/pokemon/10.png"
