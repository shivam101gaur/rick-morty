import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Character, Data, Episode, EpisodeData } from './data.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  cols: number = 3;

  window_width = window.innerWidth


  dataUrl = 'https://rickandmortyapi.com/api/character';
  episodeDataUrl = 'https://rickandmortyapi.com/api/episode'
  episodesMap = new Map<number, Episode>()

  filterCardExpanded: boolean = false

  characterList: Character[] = []

  moreDataToLoad: boolean = false

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.cols = (window.innerWidth <= 500) ? 1 : (window.innerWidth <= 1000) ? 2 : 3;
    this.getAllData();
    this.getEpisodes();
  }
  onResize(event) {
    this.cols = (window.innerWidth <= 500) ? 1 : (window.innerWidth <= 1000) ? 2 : 3;
  }
  trackByFn(index: any, item: any) {
    return index; // or item.id
  }

  //  getting all episodes 
  // from all the pages of episode api
  getEpisodes(url: string = this.episodeDataUrl) {
    this.http.get<EpisodeData>(url).subscribe(res => {

      res.results.forEach(episode => {
        this.episodesMap.set(episode.id, episode)
      })
      console.log(url)
      //if next page exists, get its data also
      if (res.info.next) { this.getEpisodes(res.info.next) }
    })
  }

  // get a episode from the episode map
  getEpisode(url: string): Episode {
    const id = Number(url.split('/').pop())
    if (this.episodesMap.get(id)) {
      return this.episodesMap.get(id)
    }
    // if episode was not found in episode map, then get the episode by it's url and store it in map
    else {
      this.http.get<Episode>(url).subscribe(res => {
        this.episodesMap.set(res.id, res)
      })
    }
  }

  scrollToTop() {
    document.getElementById('data').scrollIntoView({ behavior: "smooth" });
  }
  scrollToBottom() {
    window.scrollTo({ top: document.getElementById('data').scrollHeight, behavior: 'smooth' });
  }

  getAllData(url: string = this.dataUrl) {
    this.http.get<Data>(url).subscribe(res => {
      console.log(res);
      this.characterList.push(...res.results);
      this._snackBar.open(`${res.results.length} characters found.`, '', {
        duration: 1250,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        politeness: 'polite'
      });


      setTimeout(() => {

        window.scrollTo({ top: document.getElementById('data').scrollHeight, behavior: 'smooth' });

      }, 50);
      console.log(this.characterList)
      if (res.info.next) {
        this.dataUrl = res.info.next;
        this.moreDataToLoad = true;
        // automatically fetch all data
        // this.getAllData() 
      }
      else {
        this.moreDataToLoad = false
      }

    }, error => {
      alert('No results match the searched parameters!!');
    })
  }

  getFilteredData(filter: string, value: string) {

    this.dataUrl = `https://rickandmortyapi.com/api/character?page=1&${filter}=${value}`
    this.characterList = []
    this.getAllData()
  }
  resetFilter() {
    this.dataUrl = `https://rickandmortyapi.com/api/character?page=1`
    this.characterList = []
    this.getAllData()
  }
}

