import { Component, Input, OnInit } from '@angular/core';
import { GuidesEntPop } from '../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';
import { initGuide } from '../../../../static-data/tlcargo-static-data';
import { environment } from '../../../../environments/environment';

const this_url = environment.this_url;

@Component({
  selector: 'vex-qr-guide',
  templateUrl: './qr-guide.component.html',
  styleUrls: ['./qr-guide.component.scss']
})
export class QrGuideComponent implements OnInit {

  @Input()
  guide: GuidesEntPop = new GuidesEntPop(initGuide);

  @Input()
  pieza: string;

  urlItem = '';

  constructor() { }

  ngOnInit() {
    const tlPackage = this.guide.packageList[+this.pieza - 1]._id;
    const guideId = this.guide._id;

    this.urlItem = `${this_url}/#/app/ships/${guideId}/${tlPackage}`;
  }


}
