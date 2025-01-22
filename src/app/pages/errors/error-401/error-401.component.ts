import { Component, OnInit } from '@angular/core';
import icSearch from '@iconify/icons-ic/twotone-search';

@Component({
  selector: 'vex-error401',
  templateUrl: './error-401.component.html',
  styleUrls: ['./error-401.component.scss']
})
export class Error401Component implements OnInit {

  icSearch = icSearch;

  constructor() { }

  ngOnInit() {
  }

}
