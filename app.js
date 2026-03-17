document.addEventListener('DOMContentLoaded', () => {
    // --- Data ---
    let itemsDatabase = [];
    const rooms = {
        "Main Room": { items: [], penalties: { trash: 0, roaches: 0, dropped: 0, facingWall: 0 } },
        "Back Room": { items: [], penalties: { trash: 0, roaches: 0, dropped: 0, facingWall: 0 } },
        "Left Room": { items: [], penalties: { trash: 0, roaches: 0, dropped: 0, facingWall: 0 } },
        "Right Room": { items: [], penalties: { trash: 0, roaches: 0, dropped: 0, facingWall: 0 } },
        "Second Floor": { items: [], penalties: { trash: 0, roaches: 0, dropped: 0, facingWall: 0 } },
        "Basement": { items: [], penalties: { trash: 0, roaches: 0, dropped: 0, facingWall: 0 } }
    };
    let currentRoom = "Main Room";

    const houseRanks = {
        "Tent": { B: 0, A: 0, S: 0 },
        "House upgrade": { B: 0, A: 10000, S: 15000 },
        "House size upgrade": { B: 0, A: 17000, S: 23000 },
        "Back Room Addition": { B: 0, A: 25000, S: 35000 },
        "Left Room Addition": { B: 0, A: 38000, S: 47000 },
        "Right Room Addition": { B: 0, A: 50000, S: 60000 },
        "Second Floor Addition": { B: 0, A: 64000, S: 75000 },
        "Basement Addition": { B: 0, A: 80000, S: 90000 }
    };

    // --- DOM Elements ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResultsList = document.getElementById('search-results-list');
    const placementSelect = document.getElementById('placement-select');

    const roomTabs = document.querySelectorAll('.room-tab');
    const currentRoomNameEl = document.getElementById('current-room-name');
    const roomItemCountEl = document.getElementById('room-item-count');
    const roomItemsList = document.getElementById('room-items-list');

    const trashCount = document.getElementById('trash-count');
    const roachCount = document.getElementById('roach-count');
    const droppedCount = document.getElementById('dropped-count');
    const facingWallCount = document.getElementById('facing-wall-count');

    const houseLevelSelect = document.getElementById('house-level');
    const currentSeasonSelect = document.getElementById('current-season');
    const totalScoreEl = document.getElementById('total-score');
    const currentRankEl = document.getElementById('current-rank');
    const nextRankScoreEl = document.getElementById('next-rank-score');
    const bonusesBreakdownEl = document.getElementById('bonuses-breakdown');

    // --- Initialization ---
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            itemsDatabase = data;
            console.log(`Loaded ${itemsDatabase.length} items.`);
        })
        .catch(err => console.error("Failed to load data.json:", err));

    // --- Event Listeners ---
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    roomTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            roomTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentRoom = e.target.dataset.room;
            updateRoomView();
        });
    });

    [trashCount, roachCount, droppedCount, facingWallCount].forEach(input => {
        input.addEventListener('change', () => {
            rooms[currentRoom].penalties.trash = parseInt(trashCount.value) || 0;
            rooms[currentRoom].penalties.roaches = parseInt(roachCount.value) || 0;
            rooms[currentRoom].penalties.dropped = parseInt(droppedCount.value) || 0;
            rooms[currentRoom].penalties.facingWall = parseInt(facingWallCount.value) || 0;
            calculateScore();
        });
    });

    houseLevelSelect.addEventListener('change', calculateScore);
    currentSeasonSelect.addEventListener('change', calculateScore);

    // --- Functions ---
    function performSearch() {
        const query = searchInput.value.toLowerCase();
        if (!query) return;

        // Filter items
        const results = itemsDatabase.filter(item =>
            item.name.toLowerCase().includes(query)
        ).slice(0, 50); // Limit to 50 results for performance

        renderSearchResults(results);
    }

    function renderSearchResults(results) {
        searchResultsList.innerHTML = '';
        if (results.length === 0) {
            searchResultsList.innerHTML = '<li>No items found.</li>';
            return;
        }

        results.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name} ${item.variation ? `(${item.variation})` : ''}</div>
                    <div class="item-details">Base: ${item.hha_base_points || 0} | Series: ${item.hha_series || 'None'} | Set: ${item.hha_set || 'None'} | Concept: ${item.hha_concept_1 || 'None'} | Color: ${item.color_1}/${item.color_2}</div>
                </div>
                <div class="item-actions">
                    <button class="add-btn">Add</button>
                </div>
            `;
            li.querySelector('.add-btn').addEventListener('click', () => addItemToRoom(item));
            searchResultsList.appendChild(li);
        });
    }

    function addItemToRoom(item) {
        const placement = placementSelect.value;

        // Deep copy the item to avoid modifying the database
        const roomItem = {
            ...item,
            placement: placement,
            uniqueId: Date.now() + Math.random().toString(36).substr(2, 9)
        };

        rooms[currentRoom].items.push(roomItem);
        updateRoomView();
        calculateScore();
    }

    function removeItemFromRoom(uniqueId) {
        rooms[currentRoom].items = rooms[currentRoom].items.filter(item => item.uniqueId !== uniqueId);
        updateRoomView();
        calculateScore();
    }

    function updateRoomView() {
        currentRoomNameEl.textContent = currentRoom;

        const room = rooms[currentRoom];
        roomItemCountEl.textContent = room.items.length;

        trashCount.value = room.penalties.trash;
        roachCount.value = room.penalties.roaches;
        droppedCount.value = room.penalties.dropped;
        facingWallCount.value = room.penalties.facingWall;

        roomItemsList.innerHTML = '';
        room.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name} <span style="font-size:0.8em; color:var(--text-muted);">[${item.placement}]</span></div>
                    <div class="item-details">Base: ${item.hha_base_points || 0} | Series: ${item.hha_series || 'None'} | Concept: ${item.hha_concept_1 || 'None'}</div>
                </div>
                <div class="item-actions">
                    <button class="remove-btn">Remove</button>
                </div>
            `;
            li.querySelector('.remove-btn').addEventListener('click', () => removeItemFromRoom(item.uniqueId));
            roomItemsList.appendChild(li);
        });
    }

    // --- HHA Score Calculation ---
    function calculateScore() {
        let totalScore = 0;
        let houseBreakdown = [];
        let roomBreakdowns = [];

        // House-wide checks
        const allHouseItems = Object.values(rooms).flatMap(r => r.items);
        const houseCategories = new Set(allHouseItems.map(i => i.hha_category).filter(c => c && c !== 'None'));

        // Type Bonus (Chair, Table, Bed, Wardrobe/Dresser)
        const hasChair = allHouseItems.some(i => i.hha_category === 'Chair');
        const hasTable = allHouseItems.some(i => i.hha_category === 'Table' || i.hha_category === 'Desk'); // Assuming Desk might count, but specifically table.
        const hasBed = allHouseItems.some(i => i.hha_category === 'Bed');
        const hasDresser = allHouseItems.some(i => i.hha_category === 'Wardrobe' || i.hha_category === 'Dresser' || i.hha_category === 'Closet');

        if (hasChair && hasTable && hasBed && hasDresser) {
            totalScore += 2500;
            houseBreakdown.push("Type Bonus: +2500 (All daily life necessities present)");
        }

        // Season/Lucky Bonus (House-wide, unique items)
        const luckyNames = [
            "ACNH Nintendo Switch", "Brewstoid", "Crescent-moon chair", "Gold bug trophy",
            "Gold fish trophy", "Gold rose wreath", "Gold turtle figurine", "Golden candlestick",
            "Golden samurai suit", "Kanji tee", "Katana", "Koi", "Lucky gold cat",
            "Paradise Planning photo", "Pop-eyed goldfish", "Ring", "Robot hero"
        ];

        const seasonalItems = {
            "Spring": ["Bamboo shelf", "Cherry-blossom bonsai", "Wobbling Zipper toy"],
            "Summer": ["Anchor statue", "Artisanal bug cage", "Horned hercules", "Napoleonfish", "Palm-tree lamp", "Scorpion", "Shell wreath"],
            "Autumn": ["Cricket", "Mush parasol", "Tree's bounty big tree"],
            "Winter": ["Tarantula", "Frozen tree", "Stringfish"]
        };

        const currentSeason = currentSeasonSelect.value;
        const validSeasonalNames = currentSeason !== "None" && seasonalItems[currentSeason] ? seasonalItems[currentSeason] : [];

        // Find unique lucky/seasonal items across the house
        const uniqueBonusItems = new Set();
        allHouseItems.forEach(item => {
            let itemName = item.name;
            if (!itemName) return;

            let isLucky = luckyNames.includes(itemName) || (itemName.toLowerCase().includes("photo") && !itemName.toLowerCase().includes("brewster") && !itemName.toLowerCase().includes("isabelle") && !itemName.toLowerCase().includes("jingle") && !itemName.toLowerCase().includes("rover") && !itemName.toLowerCase().includes("tommy") && !itemName.toLowerCase().includes("tom nook"));
            let isSeasonal = validSeasonalNames.includes(itemName);

            if (isLucky || isSeasonal) {
                uniqueBonusItems.add(item.name);
            }
        });
        if (uniqueBonusItems.size > 0) {
            totalScore += uniqueBonusItems.size * 777;
            houseBreakdown.push(`Lucky/Seasonal Items Bonus: +${uniqueBonusItems.size * 777} (${uniqueBonusItems.size} unique items)`);
        }

        // Room-by-room calculations
        for (const [roomName, room] of Object.entries(rooms)) {
            if (room.items.length === 0 && Object.values(room.penalties).every(v => v === 0)) continue;

            let roomScore = 0;
            let roomBreakdown = [];

            // 1. Base Points
            let basePoints = 0;
            room.items.forEach(item => {
                basePoints += item.hha_base_points || 0;
            });
            roomScore += basePoints;
            roomBreakdown.push(`Base Points: +${basePoints}`);

            // 2. Basic Interior Design Bonus
            const itemCount = room.items.length;
            let countBonus = 0;
            if (itemCount >= 6) countBonus += 1000;
            if (itemCount >= 10) countBonus += 1000;
            if (itemCount >= 15) countBonus += 1000;
            if (itemCount >= 20) countBonus += 1000;
            if (countBonus > 0) {
                roomScore += countBonus;
                roomBreakdown.push(`Basic Interior Bonus: +${countBonus} (${itemCount} items)`);
            }

            const wallItems = room.items.filter(i => i.placement === "Wall").length;
            if (wallItems > 0) {
                const wallBonus = Math.min(wallItems * 400, 1200);
                roomScore += wallBonus;
                roomBreakdown.push(`Wall-hanging Bonus: +${wallBonus} (${wallItems} items)`);
            }

            // 3. Series Bonus
            const seriesCounts = {};
            const uniqueSeriesItems = {}; // track unique items per series
            room.items.forEach(item => {
                if (item.hha_series && item.hha_series !== "None") {
                    if (!uniqueSeriesItems[item.hha_series]) {
                        uniqueSeriesItems[item.hha_series] = new Set();
                    }
                    uniqueSeriesItems[item.hha_series].add(item.name);
                }
            });
            let bestSeries = null;
            let maxSeriesCount = 0;
            for (const [series, itemSet] of Object.entries(uniqueSeriesItems)) {
                if (itemSet.size >= 4 && itemSet.size > maxSeriesCount) {
                    maxSeriesCount = itemSet.size;
                    bestSeries = series;
                }
            }
            if (bestSeries) {
                // The points are awarded for ALL items in that series, not just unique ones according to guide?
                // Wait, "If you have 4 or more unique items from the same series displayed, you'll get 1000 points per item from that series."
                // "per item" might mean total items, let's use the total count of items in that series
                let totalItemsInSeries = room.items.filter(i => i.hha_series === bestSeries).length;
                roomScore += totalItemsInSeries * 1000;
                roomBreakdown.push(`Series Bonus (${bestSeries}): +${totalItemsInSeries * 1000}`);
            }

            // 4. Set Completion Bonus (Simplified - just checking if items have a set and assuming completion if count >= 1 is wrong.
            // Real logic: "If you displayed all of the furniture from a set...".
            // We'll approximate by assuming 2+ unique items = complete set for this simple logic,
            // or just checking if unique count > 1 to award points.
            // Better approximation: give 800 per item in a set if there are >= 2 unique items.
            const uniqueSetItems = {};
            room.items.forEach(item => {
                if (item.hha_set && item.hha_set !== "None") {
                    if (!uniqueSetItems[item.hha_set]) {
                        uniqueSetItems[item.hha_set] = new Set();
                    }
                    uniqueSetItems[item.hha_set].add(item.name);
                }
            });
            for (const [set, itemSet] of Object.entries(uniqueSetItems)) {
                if (itemSet.size >= 2) {
                    let totalItemsInSet = room.items.filter(i => i.hha_set === set).length;
                    roomScore += totalItemsInSet * 800;
                    roomBreakdown.push(`Set Bonus (${set}): +${totalItemsInSet * 800}`);
                }
            }

            // 5. Color Bonus
            if (itemCount >= 8) {
                const colorCounts = {};
                room.items.forEach(item => {
                    const c1 = item.color_1;
                    const c2 = item.color_2;
                    if (c1 && c1 !== "None") colorCounts[c1] = (colorCounts[c1] || 0) + 1;
                    if (c2 && c2 !== "None" && c2 !== c1) colorCounts[c2] = (colorCounts[c2] || 0) + 1;
                });

                let maxColorCount = 0;
                let domColor = null;
                for (const [color, count] of Object.entries(colorCounts)) {
                    if (count > maxColorCount) {
                        maxColorCount = count;
                        domColor = color;
                    }
                }

                const percentage = maxColorCount / itemCount;
                // Determine unique items of this color
                const uniqueItemsWithDomColor = new Set(room.items.filter(i => i.color_1 === domColor || i.color_2 === domColor).map(i => i.name));
                const numUnique = uniqueItemsWithDomColor.size;

                if (percentage >= 0.9) {
                    roomScore += numUnique * 600;
                    roomBreakdown.push(`Color Bonus (90% ${domColor}): +${numUnique * 600}`);
                } else if (percentage >= 0.7) {
                    roomScore += numUnique * 200;
                    roomBreakdown.push(`Color Bonus (70% ${domColor}): +${numUnique * 200}`);
                }
            }

            // 6. Feng Shui Bonus
            let fengShuiEastItems = new Set();
            let fengShuiSouthItems = new Set();
            let fengShuiWestItems = new Set();

            room.items.forEach(item => {
                const c1 = item.color_1;
                const c2 = item.color_2;
                if (item.placement === "East" && (c1 === "Red" || c2 === "Red")) fengShuiEastItems.add(item.name);
                if (item.placement === "South" && (c1 === "Green" || c2 === "Green")) fengShuiSouthItems.add(item.name);
                if (item.placement === "West" && (c1 === "Yellow" || c2 === "Yellow")) fengShuiWestItems.add(item.name);
            });

            let fengShuiPoints = 0;
            // 500 points for each wall that has at least one valid item
            if (fengShuiEastItems.size > 0) fengShuiPoints += 500;
            if (fengShuiSouthItems.size > 0) fengShuiPoints += 500;
            if (fengShuiWestItems.size > 0) fengShuiPoints += 500;
            if (fengShuiPoints > 0) {
                roomScore += fengShuiPoints;
                roomBreakdown.push(`Feng Shui Bonus: +${fengShuiPoints}`);
            }

            // 7. Category Bonus
            const uniqueCategories = new Set();
            room.items.forEach(i => {
                if (i.hha_category && i.hha_category !== "None") uniqueCategories.add(i.hha_category);
            });
            // If you have at least 3 unique furniture from a category displayed... Wait,
            // "If you have at least 3 unique furniture from a category displayed, you'll get 500 points for each categories."
            // This means we need 3 unique items OF THE SAME category.
            const categoryItemNames = {};
            room.items.forEach(i => {
                if (i.hha_category && i.hha_category !== "None") {
                    if (!categoryItemNames[i.hha_category]) categoryItemNames[i.hha_category] = new Set();
                    categoryItemNames[i.hha_category].add(i.name);
                }
            });
            let validCategories = 0;
            for (const [cat, namesSet] of Object.entries(categoryItemNames)) {
                if (namesSet.size >= 3) {
                    validCategories++;
                }
            }
            if (validCategories > 0) {
                roomScore += validCategories * 500;
                roomBreakdown.push(`Category Bonus: +${validCategories * 500}`);
            }

            // 8. Concept Bonus
            const conceptCounts = {};
            room.items.forEach(item => {
                if (item.hha_concept_1 && item.hha_concept_1 !== "None") conceptCounts[item.hha_concept_1] = (conceptCounts[item.hha_concept_1] || 0) + 1;
                if (item.hha_concept_2 && item.hha_concept_2 !== "None") conceptCounts[item.hha_concept_2] = (conceptCounts[item.hha_concept_2] || 0) + 1;
            });
            let bestConcept = null;
            let maxConceptCount = 0;
            for (const [concept, count] of Object.entries(conceptCounts)) {
                if (count >= 5 && count > maxConceptCount) {
                    maxConceptCount = count;
                    bestConcept = concept;
                }
            }
            if (bestConcept) {
                // "If 5 or more items with same concept is displayed in one room, you'll get 400 points for each item matching that concept."
                roomScore += maxConceptCount * 400;
                roomBreakdown.push(`Concept Bonus (${bestConcept}): +${maxConceptCount * 400}`);
            }

            // Penalties
            let penaltyPoints = 0;
            penaltyPoints += room.penalties.trash * 500;
            penaltyPoints += room.penalties.roaches * 2500;
            penaltyPoints += room.penalties.dropped * 1;
            penaltyPoints += room.penalties.facingWall * 300;

            if (penaltyPoints > 0) {
                roomScore -= penaltyPoints;
                roomBreakdown.push(`Penalties: -${penaltyPoints}`);
            }

            totalScore += roomScore;

            if (roomBreakdown.length > 0) {
                roomBreakdowns.push(`<strong>${roomName}:</strong> ${roomScore} points<br> - ` + roomBreakdown.join('<br> - '));
            }
        }

        // Display Score and Rank
        totalScoreEl.textContent = totalScore.toLocaleString();

        const houseLevel = houseLevelSelect.value;
        const ranks = houseRanks[houseLevel];

        let rank = "B";
        let nextScore = "-";

        if (houseLevel === "Tent") {
            rank = "N/A";
            nextScore = "Upgrade House";
        } else {
            if (totalScore >= ranks.S) {
                rank = "S";
                nextScore = "Max Rank Reached!";
            } else if (totalScore >= ranks.A) {
                rank = "A";
                nextScore = ranks.S.toLocaleString() + " (for S Rank)";
            } else {
                rank = "B";
                nextScore = ranks.A.toLocaleString() + " (for A Rank)";
            }
        }

        currentRankEl.textContent = rank;
        nextRankScoreEl.textContent = nextScore;

        let finalHtml = '';
        if (houseBreakdown.length > 0) {
            finalHtml += `<strong>House Bonuses:</strong><br> - ` + houseBreakdown.join('<br> - ') + `<br><br>`;
        }
        finalHtml += roomBreakdowns.join('<br><br>');

        bonusesBreakdownEl.innerHTML = finalHtml;
    }
});
