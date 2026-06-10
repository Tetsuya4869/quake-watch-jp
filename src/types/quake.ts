/** アプリ内で使用する整形済みの地震情報 */
export interface Quake {
  id: string;
  time: string;
  magnitude: number;
  maxIntensity: string;
  hypocenter: string;
  lat: number;
  lng: number;
}

/** P2P地震情報 API（code 551: 地震情報）のレスポンス1件分 */
export interface P2PQuakeRecord {
  _id: string;
  earthquake: {
    time: string;
    maxIntensity: number;
    hypocenter: {
      name: string;
      magnitude: number;
      latitude: number;
      longitude: number;
    };
  };
}
