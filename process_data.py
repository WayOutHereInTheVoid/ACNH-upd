import csv
import json
import os
import glob

# Files to process
csv_files = [
    "Housewares-Table 1.csv",
    "Miscellaneous-Table 1.csv",
    "Wall-mounted-Table 1.csv",
    "Ceiling Decor-Table 1.csv",
    "Rugs-Table 1.csv",
    "Wallpaper-Table 1.csv",
    "Floors-Table 1.csv",
    "Other-Table 1.csv",
    "Artwork-Table 1.csv",
    "Fossils-Table 1.csv",
    "Gyroids-Table 1.csv",
    "Insects-Table 1.csv",
    "Fish-Table 1.csv",
    "Sea Creatures-Table 1.csv",
    "Music-Table 1.csv",
    "Photos-Table 1.csv",
    "Posters-Table 1.csv",
    "ToolsGoods-Table 1.csv",
    "Clothing Other-Table 1.csv",
    "Headwear-Table 1.csv",
    "Accessories-Table 1.csv",
    "Bags-Table 1.csv",
    "Bottoms-Table 1.csv",
    "Dress-Up-Table 1.csv",
    "Shoes-Table 1.csv",
    "Socks-Table 1.csv",
    "Tops-Table 1.csv",
    "Umbrellas-Table 1.csv"
]

all_items = []

for filename in csv_files:
    if not os.path.exists(filename):
        print(f"Skipping {filename} - not found")
        continue

    print(f"Processing {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        # Determine item type from filename for tracking
        item_type = filename.split('-')[0]

        for row in reader:
            # Basic sanity check
            name = row.get("Name", "").strip()
            if not name:
                continue

            # Default attributes
            hha_base_points = 0
            if "HHA Base Points" in row and row["HHA Base Points"] and row["HHA Base Points"] != "NA":
                try:
                    hha_base_points = int(row["HHA Base Points"])
                except ValueError:
                    hha_base_points = 0

            # Some files might not have all columns, default to empty string/None
            item_data = {
                "name": name,
                "type": item_type,
                "image": row.get("Image", ""),
                "variation": row.get("Variation", "NA"),
                "hha_base_points": hha_base_points,
                "hha_concept_1": row.get("HHA Concept 1", "None"),
                "hha_concept_2": row.get("HHA Concept 2", "None"),
                "hha_series": row.get("HHA Series", "None"),
                "hha_set": row.get("HHA Set", "None"),
                "hha_category": row.get("HHA Category", "None"),
                "color_1": row.get("Color 1", "None"),
                "color_2": row.get("Color 2", "None"),
                "size": row.get("Size", "1x1"),
                "lucky": False, # Will determine in app based on name/category
                "season": row.get("Season/Event", "NA"),
                "tag": row.get("Tag", "None")
            }

            # Handle "NA" or "None" values
            for k, v in item_data.items():
                if isinstance(v, str) and (v == "NA" or v == "None"):
                    item_data[k] = None

            # ACNH spreadsheet has variations (e.g. color variations of same item).
            # We want to group variations together or just list unique items.
            # Let's include the variant ID or variation name to make it unique if needed,
            # or just list every variation as a separate item. For simplicity in the app,
            # we can just use the item data directly.
            item_data["id"] = row.get("Unique Entry ID", f"{name}_{item_data['variation']}")

            all_items.append(item_data)

# Save to data.json
with open("data.json", "w", encoding='utf-8') as f:
    json.dump(all_items, f, ensure_ascii=False, indent=2)

print(f"Processed {len(all_items)} items. Saved to data.json.")
