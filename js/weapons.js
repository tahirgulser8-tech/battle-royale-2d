// Silah, Ekipman, Dürbün ve Çanta Tanımları
const WEAPONS = {
    fists: {
        id: 'fists',
        name: 'Yumruk',
        type: 'melee',
        damage: 18,
        fireRate: 300,
        range: 48,
        color: '#e0a96d',
        barrelLength: 10,
        unlimitedAmmo: true,
        icon: '👊'
    },
    pistol: {
        id: 'pistol',
        name: 'Glock-18',
        type: 'ranged',
        damage: 23,
        fireRate: 190,
        magSize: 15,
        reloadTime: 1200,
        bulletSpeed: 19,
        spread: 0.05,
        bulletSize: 3.5,
        bulletColor: '#ffd43b',
        range: 650,
        ammoType: 'pistol_ammo',
        barrelLength: 26,
        soundType: 'pistol',
        icon: '🔫'
    },
    smg: {
        id: 'smg',
        name: 'MP5 Hafif Makineli',
        type: 'ranged',
        damage: 18,
        fireRate: 80,
        magSize: 30,
        reloadTime: 1400,
        bulletSpeed: 21,
        spread: 0.11,
        bulletSize: 3.2,
        bulletColor: '#ffe066',
        range: 600,
        ammoType: 'pistol_ammo',
        barrelLength: 28,
        soundType: 'smg',
        icon: '⚡'
    },
    shotgun: {
        id: 'shotgun',
        name: 'SPAS-12 Pompalı',
        type: 'ranged',
        damage: 17,
        pellets: 6,
        fireRate: 850,
        magSize: 6,
        reloadTime: 2200,
        bulletSpeed: 16,
        spread: 0.22,
        bulletSize: 3,
        bulletColor: '#ff922b',
        range: 420,
        ammoType: 'shotgun_ammo',
        barrelLength: 32,
        soundType: 'shotgun',
        icon: '💥'
    },
    rifle: {
        id: 'rifle',
        name: 'AK-47',
        type: 'ranged',
        damage: 26,
        fireRate: 115,
        magSize: 30,
        reloadTime: 1800,
        bulletSpeed: 23,
        spread: 0.08,
        bulletSize: 4,
        bulletColor: '#ffa94d',
        range: 850,
        ammoType: 'rifle_ammo',
        barrelLength: 36,
        soundType: 'rifle',
        icon: '🔫'
    },
    dmr: {
        id: 'dmr',
        name: 'SKS Nişancı Tüfeği',
        type: 'ranged',
        damage: 48,
        fireRate: 320,
        magSize: 20,
        reloadTime: 1900,
        bulletSpeed: 27,
        spread: 0.035,
        bulletSize: 4.5,
        bulletColor: '#fab005',
        range: 1100,
        ammoType: 'rifle_ammo',
        barrelLength: 40,
        soundType: 'dmr',
        icon: '🎯'
    },
    sniper: {
        id: 'sniper',
        name: 'AWM Keskin Nişancı',
        type: 'ranged',
        damage: 96,
        fireRate: 1400,
        magSize: 5,
        reloadTime: 2600,
        bulletSpeed: 34,
        spread: 0.008,
        bulletSize: 5.5,
        bulletColor: '#ff6b6b',
        range: 1500,
        ammoType: 'sniper_ammo',
        barrelLength: 44,
        soundType: 'sniper',
        icon: '🎯'
    },
    rpg: {
        id: 'rpg',
        name: 'RPG-7 Roketatar',
        type: 'ranged',
        isRocket: true,
        damage: 135,
        fireRate: 2000,
        magSize: 1,
        reloadTime: 2800,
        bulletSpeed: 13,
        spread: 0.02,
        bulletSize: 7,
        bulletColor: '#ff4d4f',
        range: 1200,
        ammoType: 'rocket_ammo',
        barrelLength: 42,
        soundType: 'rpg',
        icon: '🚀'
    }
};

// Toplanabilir Eşyalar (Dürbünler ve Çantalar Dahil)
const ITEM_TYPES = {
    // Dürbünler (Görüş alanını genişletir)
    scope_2x: {
        id: 'scope_2x',
        name: '2x Dürbün',
        type: 'scope',
        level: 2,
        zoom: 0.82, // 1.0 normal görüş, 0.82 daha geniş alan
        icon: '🔍',
        radius: 13
    },
    scope_4x: {
        id: 'scope_4x',
        name: '4x Dürbün',
        type: 'scope',
        level: 4,
        zoom: 0.68, // Çok daha geniş alan
        icon: '🔭',
        radius: 14
    },
    scope_8x: {
        id: 'scope_8x',
        name: '8x Nişancı Dürbünü',
        type: 'scope',
        level: 8,
        zoom: 0.52, // En geniş panoramik görüş alanı
        icon: '🎯',
        radius: 15
    },

    // Çantalar (Mermi ve Eşya Kapasitesini Artırır)
    backpack_1: {
        id: 'backpack_1',
        name: 'Seviye 1 Çanta',
        type: 'backpack',
        level: 1,
        capMult: 1.5,
        icon: '🎒',
        radius: 14
    },
    backpack_2: {
        id: 'backpack_2',
        name: 'Seviye 2 Askeri Çanta',
        type: 'backpack',
        level: 2,
        capMult: 2.2,
        icon: '🎒',
        radius: 15
    },
    backpack_3: {
        id: 'backpack_3',
        name: 'Seviye 3 Taktik Çanta',
        type: 'backpack',
        level: 3,
        capMult: 3.0,
        icon: '🎒',
        radius: 16
    },

    // İyileşme ve Zırh
    medkit: {
        id: 'medkit',
        name: 'Büyük Can Kiti',
        type: 'heal',
        amount: 100,
        maxTarget: 100,
        useTime: 3000,
        icon: '➕',
        radius: 14
    },
    bandage: {
        id: 'bandage',
        name: 'Sargı Bezi',
        type: 'heal',
        amount: 20,
        maxTarget: 75,
        useTime: 1400,
        icon: '🩹',
        radius: 12
    },
    shield_potion: {
        id: 'shield_potion',
        name: 'Kalkan İksiri',
        type: 'shield',
        amount: 50,
        maxTarget: 100,
        useTime: 2200,
        icon: '🛡️',
        radius: 14
    },
    armor_vest: {
        id: 'armor_vest',
        name: 'Çelik Yelek',
        type: 'armor',
        amount: 50,
        maxTarget: 100,
        icon: '🦺',
        radius: 15
    },

    // Cephaneler
    ammo_pistol: {
        id: 'ammo_pistol',
        name: '9mm Mermi',
        type: 'ammo',
        ammoType: 'pistol_ammo',
        amount: 30,
        icon: '📦',
        radius: 11
    },
    ammo_shotgun: {
        id: 'ammo_shotgun',
        name: 'Pompalı Fişeği',
        type: 'ammo',
        ammoType: 'shotgun_ammo',
        amount: 12,
        icon: '📦',
        radius: 11
    },
    ammo_rifle: {
        id: 'ammo_rifle',
        name: '7.62mm Mermi',
        type: 'ammo',
        ammoType: 'rifle_ammo',
        amount: 60,
        icon: '📦',
        radius: 11
    },
    ammo_sniper: {
        id: 'ammo_sniper',
        name: '.300 Magnum Mermi',
        type: 'ammo',
        ammoType: 'sniper_ammo',
        amount: 10,
        icon: '📦',
        radius: 11
    },
    ammo_rocket: {
        id: 'ammo_rocket',
        name: 'RPG Roketi',
        type: 'ammo',
        ammoType: 'rocket_ammo',
        amount: 2,
        icon: '🚀',
        radius: 12
    }
};

window.WEAPONS = WEAPONS;
window.ITEM_TYPES = ITEM_TYPES;
