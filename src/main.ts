import './styles.css'
import { VoxelBeachApp } from './app'

const mount = document.getElementById('app')
if (!mount) {
  throw new Error('Missing #app mount node')
}

const app = new VoxelBeachApp(mount)
app.start()
