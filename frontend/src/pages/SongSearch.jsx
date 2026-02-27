import './SongSearch.css'
import HomeButton from '../components/HomeButton'

export default function SongSearch() {
  return (
    <div className="song-search-page">
      <HomeButton />
      <div className="wip-container">
        <h1>Work in Progress</h1>
      </div>
      <div className="floor"></div>
    </div>
  )
}
