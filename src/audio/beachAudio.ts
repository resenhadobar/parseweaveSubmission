import musicUrl from '../assets/audio/beach_groove_loop.wav'
import yeahUrl from '../assets/audio/delivery_yeah.mpga?url'
import oceanUrl from '../assets/audio/ocean_loop.mpga?url'
import windUrl from '../assets/audio/ride_wind_loop.mpga?url'

type LoopName = 'music' | 'ocean' | 'wind'

const targets: Record<LoopName, number> = {
  music: 0.34,
  ocean: 0.28,
  wind: 0.24,
}

export class BeachAudioController {
  private readonly music = new Audio(musicUrl)
  private readonly ocean = new Audio(oceanUrl)
  private readonly wind = new Audio(windUrl)
  private readonly yeah = new Audio(yeahUrl)
  private unlocked = false

  constructor() {
    this.setupLoop(this.music, 'music')
    this.setupLoop(this.ocean, 'ocean')
    this.setupLoop(this.wind, 'wind')
    this.yeah.preload = 'auto'
    this.yeah.volume = 0.72
    this.wind.volume = 0
    window.addEventListener('pointerdown', () => this.unlock(), { once: true })
    window.addEventListener('keydown', () => this.unlock(), { once: true })
    console.info(
      '[VoxelBeach] Beach audio loops prepared; first input starts music, surf, and ride wind'
    )
  }

  update(speed: number, skating: boolean): void {
    if (!this.unlocked) return
    const windTarget = skating ? Math.min(targets.wind, Math.max(0, (Math.abs(speed) - 3) / 28)) : 0
    this.wind.volume += (windTarget - this.wind.volume) * 0.08
  }

  playDeliveryYeah(): void {
    if (!this.unlocked) return
    this.yeah.currentTime = 0
    void this.yeah.play()
    console.info('[VoxelBeach] Delivery yeah sound played')
  }

  private setupLoop(audio: HTMLAudioElement, name: LoopName): void {
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = targets[name]
  }

  private unlock(): void {
    if (this.unlocked) return
    this.unlocked = true
    void this.music.play()
    void this.ocean.play()
    void this.wind.play()
    console.info('[VoxelBeach] Beach audio loops started')
  }
}
