export const questPool = {
  daily: [
    {
      id: "d1",
      name: "Spot 50 biler",
      type: "countCars",
      goal: 50,
      reward: 300
    },
    {
      id: "d2",
      name: "Spot 30 biler",
      type: "countCars",
      goal: 30,
      reward: 150
    },
    {
      id: "d3",
      name: "Skilt inneholder DL",
      type: "hasText",
      value: "DL",
      goal: 1,
      reward: 200
    },
    {
      id: "d4",
      name: "Summen av tall = 18",
      type: "sumEquals",
      value: 18,
      goal: 3,
      reward: 120
    },
    {
      id: "d5",
      name: "Dobbel bokstav i skilt",
      type: "doubleLetter",
      goal: 5,
      reward: 100
    },
    {
      id: "d6",
      name: "Trippel Siffer",
      type: "tripleDigit",
      goal: 2,
      reward: 100
    },
    {
      id: "d7",
      name: "Finn 67",
      type: "hasNumber",
      value: "67",
      goal: 2,
      reward: 167
    },
    {
  id: "d8",
  name: "😎 Bli en Player (KJ)",
  type: "hasText",
  value: "KJ",
  goal: 4,
  reward: 150
    },
    {
      id: "d9",
      name: "Bil fra Drammen (K + EFHJKLNPRS)",
      type: "hasText",
      value: ["KE", "KF", "KH", "KJ", "KK", "KL", "KN", "KP", "KR", "KS"],
      goal: 7,
      reward: 200
    },
    {
      id: "d10",
      name: "Speilet (Symmetrisk Tall)",
      type: "palindrome",
      goal: 1,
      reward: 200
    },
    {
      id: "d11",
      name: "Bil fra Lillehammer (FB, H + STUVX)",
      type: "hasText",
      value: ["FB", "HS", "HT", "HU", "HV", "HX"],
      goal: 1,
      reward: 500
    },
    {
  id: "d12",
  name: "Summen er under 12",
  type: "sumUnder",
  value: 12,
  goal: 3,
  reward: 200
},
    {
      id: "d13",
      name: "Summen er over 33",
      type: "sumOver",
      value: 33,
      goal: 3,
      reward: 200
    }
  ],

  weekly: [
    {
      id: "w1",
      name: "Spot 300 biler",
      type: "countCars",
      goal: 300,
      reward: 1000
    },
    {
      id: "w2",
      name: "Spot 7 DL-skilt",
      type: "hasText",
      value: "DL",
      goal: 7,
      reward: 500
    },
    {
      id: "w3",
      name: "Finn en forsvars- eller ambassadebil (FE-CD)",
      type: "hasText",
      value: ["FE", "CD"],
      goal: 1,
      reward: 1000
    },
       {
  id: "w12",
  name: "Summen er over 38",
  type: "sumOver",
  value: 38,
  goal: 7,
  reward: 800
} 
  ]
};
