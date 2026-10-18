<script lang="ts">
  import { asset } from '$app/paths';
  import EventGallery from '#lib/components/EventGallery.svelte';
  import { galleries } from '#lib/data/galleries.ts';
</script>

<section class="page-hero page-hero--image" aria-labelledby="page-title">
  <div class="page-hero__inner content-container">
    <h1 id="page-title">All Events and News</h1>
  </div>
</section>

<section class="content-section content-section--dark content-section--compact events-heading" aria-labelledby="upcoming-events-title">
  <div class="content-container">
    <h2 class="events-section-title" id="upcoming-events-title"><u>Upcoming Events</u></h2>
  </div>
</section>

<article class="content-section event-entry" aria-labelledby="event-christmas-drinks-2026">
  <div class="content-container event-entry__content">
    <h3 class="event-entry__title event-title" id="event-christmas-drinks-2026">Christmas Drinks 2026</h3>
    <figure class="event-poster">
      <img src={asset("assets/images/events/christmas-drinks-2026.webp")} width="300" height="537" alt="CHRISTMAS DRINKS 2026
Dear Members.
The Committee is planning to hold the Christmas Drinks on Friday 4th of December, 2026.
Prices will be 10 euros per person, but the Committee will subsidize Members and their partner/spouse to a price of 5 euros.
Other guests pay 10 euros.
A welcome drink will also be given to all attending. Other drinks must be purchased.
There will be finger food and appetizers.
We ask you to keep the date of Friday 4th of December open and hope to see many of you you for this occasion, even to give each other our best wishes for Christmas and the New Year.
Anyone interested can notify one of the members of the Committee by no later than Friday 20th of November.
More details, such as time and location, will be announced further.
Thanks in advance." decoding="async">
    </figure>
  </div>
</article>

<div class="events-spacer" aria-hidden="true"></div>

<section class="content-section content-section--dark content-section--compact events-heading" aria-labelledby="past-events-title">
  <div class="content-container">
    <h2 class="events-section-title" id="past-events-title"><u>Past Events</u></h2>
  </div>
</section>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-29-july-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-29-july-2026">29 July 2026</h3>
        <p>Dear members.</p>
        <p>Today three members of our Veterans Committee, Tony Grech, Aristide Galea and Noel Mifsud, attended a courtesy meeting with Dr G. Bedingfield, Minister of the Interior and National Security. We continued to discuss the issues that we had raised with both Prime Minister Dr R. Abela and the Leader of the Opposition Dr A. Borg before the election last May.</p>
        <ol type="a">
          <li>It was a satisfying meeting because we saw great cooperation on the part of the Ministry.</li>
          <li>The Minister assured us that he will discuss our proposals and get back to us.</li>
        </ol>
        <p>As you can see, although the Office is closed, as a Committee we are continuing to do our best to discuss matters with those concerned. We appeal to anyone who is not a member, but a follower of this page, to become a member because the more support we have, the more openly we can speak.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/72521e73627a7ee3c4895c1eee57d5b8.jpg")} width="809" height="540" alt="Photograph from 29 July 2026" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-17-june-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-17-june-2026">17 June 2026</h3>
        <h4 class="event-entry__subtitle">Malta Veterans Association Vacation Closure Period</h4>
        <p>The Office at Luqa Barracks will re-open on Monday, 5 October 2026.</p>
        <p>If any AFM Veteran needs to contact the Committee:</p>
        <p><strong>Mobile No:</strong> 7957 1919<br>Please make calls during regular business hours:<br>0900 hrs – 1600 hrs.</p>
        <p>Thanks for your cooperation.</p>
      </div>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-11-june-2026" data-featured-photo="3">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-3" data-source-layout="II5mzb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-11-june-2026">11 June 2026</h3>
        <ol>
          <li>The Malta Veterans Association would like to express its appreciation to Lt Col M. Camilleri AFM for the invitation he extended to our Association for a BBQ, which was held today at 3 Regiment AFM Safi Barracks.</li>
          <li>The Committee would also like to thank the members who attended this activity.</li>
        </ol>
      </div>

    </div>
    
    <EventGallery id="event-11-june-2026" gallery={galleries["event-11-june-2026"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-7-june-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-7-june-2026">7 June 2026</h3>
        <p>Today we honour the courage of ordinary Maltese who stood up for dignity and justice on Sette Giugno 1919. As veterans, we recognise the same values that bind service: duty, sacrifice, and solidarity. On this national day we remember the four who fell, Carmelo Abela, Manuel Attard, Guze Bajada and Wenzu Dyer, the families they left behind, and the generations who inherited their resolve.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/81d48a1c7a08eeea281b075900a35d48.jpg")} width="526" height="789" alt="Photograph from 7 June 2026" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-25-april-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-25-april-2026">25 April 2026</h3>
        <p>Today two members of the Committee, Noel Mifsud and Aristide Galea, attended a ceremony to commemorate the 111th Anniversary of ANZAC Day.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/3b32c24e205d39aa5cea32a05ab95133.jpg")} width="1232" height="1640" alt="Photograph 1 of 2 from 25 April 2026" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/42042fcb7cd8b2ef171d50fb72219be8.jpg")} width="1530" height="2040" alt="Photograph 2 of 2 from 25 April 2026" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-18-april-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-18-april-2026">18 April 2026</h3>
        <p>Today three members of the Committee, Alfred Reale, Noel Mifsud and Aristide Galea, and Captain Ray Xuereb (Retired) attended a ceremony to commemorate the 84th anniversary of Malta receiving the George Cross.</p>
        <p>Thanks to the members of the Committee and to Captain R. Xuereb (Retired), who is the Official Standard Bearer of the Association.</p>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/1cc631390ffa1a6cd9497e9f54099752.jpg")} width="2000" height="900" alt="Photograph 1 of 3 from 18 April 2026" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="II5mzb">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/d76de65f58701cdcea16441d1ab0369c.jpg")} width="1530" height="2040" alt="Photograph 2 of 3 from 18 April 2026" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/051ae8ff7e8a2a29cda8c35d920869b0.jpg")} width="1530" height="2040" alt="Photograph 3 of 3 from 18 April 2026" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-15-april-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-15-april-2026">15 April 2026</h3>
        <p>Dear members.</p>
        <p>As planned, today, April 15, 2026, members of the Committee had a courtesy meeting with the Prime Minister at his Office in Berga-ta-Castille. The following points were discussed at the meeting:</p>
        <ol type="a">
          <li>Service and Social Services Pensions;</li>
          <li>Collective Agreements made vis-à-vis us Veterans;</li>
          <li>Service and Veterans’ Widows’ Pensions;</li>
          <li>The Pink Card;</li>
          <li>Compensation for Our Work Over the Years;</li>
          <li>EVRF and Their Engagement (at the request of Veteran members who are EVRFs);</li>
          <li>The Situation in Cases of Injustices Affecting Veterans.</li>
        </ol>
        <p>This post is being uploaded for the information of members. As you can see, we are doing our best to discuss the needs of our veterans.</p>
        <p>I would like to appeal to those who are not members, but followers of this page, to become members because the more support we have, the more we can speak face to face.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/2883b7eb83af2071296231cca0f49794.jpg")} width="2040" height="1530" alt="Photograph from 15 April 2026" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-9-april-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-9-april-2026">9 April 2026</h3>
        <p>Dear members.</p>
        <p>Four members of the Committee, Tony Grech, Noel Mifsud, Aristide Galea and Roger Muscat, had a courtesy meeting with a delegation of the Nationalist Party led by Dr Alex Borg, Leader of the Opposition. At the meeting, which was a cordial one, we raised the following points:</p>
        <ol type="a">
          <li>Service and Social Services Pensions;</li>
          <li>Collective Agreements made vis-à-vis us Veterans;</li>
          <li>Service and Veterans’ Widows’ Pensions;</li>
          <li>The Pink Card;</li>
          <li>Compensation for our work over the years;</li>
          <li>EVRF and their Engagement (at the request of Veteran members who are EVRFs).</li>
        </ol>
        <p>This post is being uploaded so that members are informed. Something that definitely struck us was being asked how many Veterans we think are left and how many are members.</p>
        <p>On behalf of the Committee, I appeal to anyone who is not a member, but a follower of this page, to become a member because, as they say, where there is a Community there is strength.</p>
        <p>Thank you. Greetings.</p>
      </div>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-27-february-2026">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-27-february-2026">27 February 2026</h3>
        <p>The Annual General Meeting (AGM) of the Malta Veterans Association was successfully held on Friday, 27th February 2026, at the WO &amp; SGTs Mess Barracks, Luqa.</p>
        <p>The meeting was well attended and provided members with the opportunity to discuss matters concerning the Association, its activities, governance, and future direction.</p>
        <p>In accordance with the Association’s statute, the current committee was formally dissolved and the election of the committee took place.</p>
        <p>Following the voting process, the members voted in favour of retaining the same committee for the coming term. Tony Grech was re-elected as President, while Maria Gatt was re-elected as Vice-President.</p>
        <p>The Malta Veterans Association would like to thank all members who attended and participated in the AGM, contributing towards its successful conclusion. The continued support and involvement of our members remain essential to the strength and future of the Association.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="II5mzb">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/c356de68ccc7976c1365f40738e384fc.jpg")} width="1920" height="1440" alt="Photograph 1 of 2 from 27 February 2026" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/d5d297bccfdd613f57b0c15fb1074304.jpg")} width="1920" height="1440" alt="Photograph 2 of 2 from 27 February 2026" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-24-december-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-24-december-2025">24 December 2025</h3>
        <p>As is customary on these feast days, this year too, the Armed Forces of Malta will celebrate the solemn function of the beloved Christmas night on 24th December. The Church will be open in the evening from 6:45pm onwards. While the Veterans Association urges members to attend, we ask that everyone be in their seats by 7:20pm. The Liturgical Service starts at 7:30pm with Christmas Carols.</p>
        <p>After the celebration of the Eucharist, we will give each other good wishes while we taste together some mince pies and mulled wine.</p>
        <p>When arriving in Luqa, the best access to the Barracks and the Church is from the roundabout and from the Old Airport Car Park.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-3 event-gallery-grid" data-source-layout="c5RTEf">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/0dc1e8545ecfc32b3328acdcd121b76e.jpg")} width="459" height="512" alt="Photograph 1 of 3 from 24 December 2025" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/5b2838a67a50d4018823cd9563c3884c.jpg")} width="472" height="590" alt="Photograph 2 of 3 from 24 December 2025" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/4e8a85b224452a8a36c016f14aac28e7.jpg")} width="472" height="590" alt="Photograph 3 of 3 from 24 December 2025" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--featured" aria-labelledby="event-19-november-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="wNfPc">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-19-november-2025">19 November 2025</h3>
        <p>The Vice President of the Association, Ms Maria Gatt, attended the Remembrance Day ceremony held by the German Embassy in Malta.&nbsp;</p>
      </div>
      <div class="event-layout__item media-frame media-frame--video">
        <iframe src="https://www.youtube-nocookie.com/embed/YhqlGQg-HIs" title="MVA German Embassy" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-12-november-2025" data-featured-photo="2">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-3" data-source-layout="wNfPc">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-12-november-2025">12 November 2025</h3>
      </div>
      <div class="event-layout__item event-copy prose">
        <p>The Committee would like to thank the Army Chaplain, Capt Rev J.M. Meli AFM, and Lieut Fr S. Fenech for their contribution in the Mass held today to remember those who have passed away over the years.</p>
        <p>Last but not least we would like to thank those who attended this function</p>
      </div>
      
    </div>

    <EventGallery id="event-12-november-2025" gallery={galleries["event-12-november-2025"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-11-november-2025" data-featured-photo="6">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-3" data-source-layout="II5mzb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-11-november-2025">11 November 2025</h3>
        <p>A member of the Malta Veterans Association AFM Committee participated in the Armistice Day commemoration at the Saluting Battery and the L- Addolorata Cemetery.</p>
      </div>

    </div>

    <EventGallery id="event-11-november-2025" gallery={galleries["event-11-november-2025"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-9-november-2025" data-featured-photo="2">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-3" data-source-layout="wNfPc">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-9-november-2025">9 November 2025</h3>
        <p>On behalf of the Association Committee I would like to thank everyone for their part in the Remembrance Day Commemoration. The ceremony began with a member of the Committee representing the Association at the Pontifical Mass at St. John's Co-Cathedral. Afterwards a squad represented the Association in the Parade at the Cenotaph Monument in Floriana.&nbsp;</p>
      </div>

    </div>

    <EventGallery id="event-9-november-2025" gallery={galleries["event-9-november-2025"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-26-september-2025" data-featured-photo="1">
  <div class="content-container event-entry__content">
    
    <div class="event-layout--content-only event-layout event-layout--columns-4" data-source-layout="wNfPc">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-26-september-2025">26 September 2025</h3>
        <p>The committee would like to thank Lt Col J Gatt AFM, and all those who contributed to the BBQ organised by the Maritime Squadron for the Malta Veterans Association AFM.&nbsp; We would also like to thank Brig CJ O’Neill AFM, Commander AFM, GS Col M Haber AFM and ADC Capt E Borg AFM.&nbsp; Last but not least, we would like also thank all this who attended this evening.&nbsp;</p>
      </div>

    </div>
    
    <EventGallery id="event-26-september-2025" gallery={galleries["event-26-september-2025"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-12-august-2025" data-featured-photo="2">
  <div class="content-container event-entry__content">
    
    <div class="event-layout--content-only event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-12-august-2025"><strong>12 August 2025</strong></h3>
        <p>The MVA proudly took part in the <strong>83rd Anniversary of Operation Pedestal Commemorative Event</strong>, honoring the crucial British convoy known locally as <em>Il-Konvoj ta’ Santa Marija</em> which provided desperately needed supplies to Malta during the siege of World War II in 1942.</p>
        <p>The ceremony was held at <strong>Pinto Wharf, Valletta</strong>, on Tuesday, 12 August 2025. The MVA was represented by <strong>Ms. M. Gatt</strong>, Vice President and wreath layer, together with <strong>Mr. N. Gafa</strong>, who was the Standard Bearer</p>
      </div>
      
    </div>
    
    <EventGallery id="event-12-august-2025" gallery={galleries["event-12-august-2025"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-july-11-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-july-11-2025"><strong>July 11, 2025</strong></h3>
        <p>The Association Committee would like to thank the WOs &amp; Sgts Mess Committee for the invitation and a wonderful and enjoyable evening.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/96cf7ebfa540ffe746447cd994877fc6.png")} width="1600" height="1204" alt="Photograph from July 11, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-12-june-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-12-june-2025"><strong>12 June, 2025</strong></h3>
        <p>Annual 3rd Regt AFM Pig Roast and AFM Veterans Association&nbsp;</p>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/803a6cd6ecef2f05b313ad447e7ff6ba.png")} width="2000" height="1500" alt="Photograph 1 of 3 from 12 June, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="II5mzb">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/85524a08c7d229741e4a160908dad1c4.png")} width="1536" height="2048" alt="Photograph 2 of 3 from 12 June, 2025" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/b064f34188f010787f7b5767daa8e08c.png")} width="1539" height="2048" alt="Photograph 3 of 3 from 12 June, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--spacer" data-source-layout="R6PoUb" aria-hidden="true"></div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-25-april-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-25-april-2025"><strong>25 April, 2025</strong></h3>
        <p><strong>Anzac Day Commemoration at Pietà Military Cemetery</strong></p>
        <p>Each year, <strong>Australia and New Zealand</strong> co-host a special service to commemorate <strong>Anzac Day</strong> on <strong>25th April</strong> at <strong>Pietà Military Cemetery</strong>. This event honours the <strong>Australians and New Zealanders</strong> who lost their lives at <strong>Gallipoli in 1915</strong> and in subsequent military and peacekeeping operations. It also acknowledges Malta's role in caring for the sick and wounded during times of conflict.</p>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/74511a5853846d4b3242eacdff2de7aa.png")} width="640" height="480" alt="Photograph 1 of 3 from 25 April, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/bbbc433c57b646145b75e8b0511adddb.png")} width="1600" height="1066" alt="Photograph 2 of 3 from 25 April, 2025" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/07ea87cc67083000f96a7c4ffbdef8a6.png")} width="1200" height="1600" alt="Photograph 3 of 3 from 25 April, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-3-march-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-3-march-2025"><strong>3 March, 2025</strong></h3>
        <p><strong>Meeting with Minister Byron Camilleri and Brigadier Clinton J. O'Neill</strong></p>
        <p>The Committee extends its gratitude to Minister Byron Camilleri (Ministry for Home Affairs, Security, and Employment) and CAFM Brigadier Clinton J. O'Neill for their warm welcome at today's meeting.</p>
        <p>Represented by Mr. A. Grech, Mr. A. Galea, Mr. M. Schembri, and Mr. A. Reale, the Committee discussed several key issues, including topics proposed during this year's AGM.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="qWD73c">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/46de05625844d80d2b62a61421d08889.jpg")} width="720" height="540" alt="Photograph from 3 March, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-veterans-lunch-28-march-2025" data-featured-photo="3">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-veterans-lunch-28-march-2025">Veterans Lunch 28 March, 2025</h3>
        <p>MVA lunch held today at VLTC Kordin. A Big Thanks to all those who attended.&nbsp;</p>
      </div>
    </div>

    <EventGallery id="event-veterans-lunch-28-march-2025" gallery={galleries["event-veterans-lunch-28-march-2025"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-13-february-2025">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-13-february-2025"><strong>13 February, 2025</strong></h3>
        <h4 class="event-entry__subtitle">The MVA Annual General Meeting</h4>
        <p>As requested by many of you, this year’s Annual General Meeting was held at the Marsa Sports Club.</p>
        <p>What Happened:<br> We presented a full review of the Association’s work over the past year. Your presence was highly valued, and we sincerely thank all members who attended.</p>
        <p>We appreciate your continued support!</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/fb76686a9bc6b26d33f6bcb36338494e.png")} width="909" height="397" alt="Photograph from 13 February, 2025" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-12-december-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-12-december-2024">12 December, 2024</h3>
        <p>The Veteran's Association Committee extends its heartfelt thanks to the CAFM, distinguished guests, and all attendees (including spouses, partners, and guests) for joining this year’s Christmas Drinks held on 12 December 2024 at the VLTC snack bar. We also gratefully acknowledge the support of our sponsors: Welbee’s Supermarket, Australian Butcher, Cellphone (Hamrun), and the other anonymous contributors.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-2" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <p>We would like to present this video to commemorate the event:</p>
      </div>
      <div class="event-layout__item media-frame media-frame--video">
        <iframe src="https://www.youtube-nocookie.com/embed/UBCrneprLL0" title="MVA - VLTC Christmas Drinks Event" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-29-november-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="Clt0zb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-29-november-2024">29 November, 2024</h3>
        <p>The committee would like to thank Commander AFM, the 4th Regiment and&nbsp; Father Meli together with Father Sergio for the mass held today at the AFM Chapel in remembrance of those who have passed away. Although the occasion was sombre it was still a pleasure to meet with the widows and veterans.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="c5RTEf">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/1286ea10209cc859afc176a8b59b4d94.jpg")} width="906" height="681" alt="Photograph from 29 November, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-13-november-2024" data-featured-photo="5">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="c5RTEf">
      
    </div>
    <div class="event-layout event-layout--columns-2" data-source-layout="wNfPc">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-13-november-2024"><strong>13 November, 2024</strong></h3>
      </div>
      <div class="event-layout__item event-copy prose">
        <p>The Veterans Association once again held a lunch at the VLTC snack bar. Thanks everyone for attending.&nbsp;</p>
      </div>
    </div>
    
    <EventGallery id="event-13-november-2024" gallery={galleries["event-13-november-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-remembrance-day-10-november-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-3" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-remembrance-day-10-november-2024">Remembrance Day - 10 November, 2024</h3>
        <p>Also known as Poppy Day, Malta marked Remembrance Day at the eleventh hour. In most countries, Remembrance Day is observed at the eleventh hour on the eleventh day of the eleventh month.</p>
        <p>The Armistice, an agreement to end World War I fighting as a prelude to peace negotiations, began at 11am on November 11, 1918. Also remembered the soldiers who gave their lives in the many conflicts since then.</p>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/38eadd09dedbfab4885f1a0a14d53784.jpg")} width="720" height="651" alt="Photograph 1 of 4 from Remembrance Day - 10 November, 2024" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/351e777a5526c736273f73dd38de6c0c.jpg")} width="753" height="950" alt="Photograph 2 of 4 from Remembrance Day - 10 November, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-3" data-source-layout="qWD73c">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/059c1cffdf9ff0879dc86e0794f3e803.png")} width="1706" height="1280" alt="Photograph 3 of 4 from Remembrance Day - 10 November, 2024" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/0c43e7509520316c7af670f25c3805c5.jpg")} width="2048" height="1536" alt="Photograph 4 of 4 from Remembrance Day - 10 November, 2024" loading="lazy" decoding="async">
      </figure>
      <div class="event-layout__item event-copy prose">
        <p>This year the MVA, took an active part in the Remembrance Day Parade on 10th November 2024, by providing a squad made up from members of the Association, The Association also paraded its Standard for the first time on the occasion. A wreath was laid on behave of all Veterans.</p>
      </div>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-27-october-2024" data-featured-photo="5">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-6" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-27-october-2024">27 October, 2024</h3>
      </div>
      <div class="event-layout__item event-copy prose">
        <p>For the first time, the Veterans Association was invited to participate in this year’s AFM Open Day 2024 held at Haywarf Base.</p>
        <p>A stand was reserved near the main entrance alongside the AFM records stand.</p>
        <p>Committee members sporting our newly designed polo shirts were present all day long.</p>
        <p>At one point the CAFM Brig Clinton J. O'Neill and Shadow Minister Darren Carabott visited the stand and talked to the committee members present.</p>
      </div>

    </div>
    
    <EventGallery id="event-27-october-2024" gallery={galleries["event-27-october-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-4-october-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-3" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-4-october-2024">4 October, 2024</h3>
      </div>
      <div class="event-layout__item event-copy prose">
        <p>President Anthony Grech, Secretary Keith Greengrass and PRO Marc Schembri had a courtesy meeting with the Leader of the Opposition Dr Bernard Grech and the Shadow Ministers Darren Carabott and Paula Mifsud Bonnici. During this meeting they stressed the importance of the soldiers being encouraged to continue to provide service even after they have passed the 25 years of service. This is apart from the fact that those who do not continue should be given the necessary help to find opportunities after they have finished the service. They also said that currently in this association there are around 380 members - all former soldiers in the army. For his part the Leader of the Nationalist Party Bernard Grech claimed the importance of the Armed Forces of our country, while he reiterated that the Nationalist Party will continue to work so that the soldiers have the best possible conditions.</p>
      </div>
      <div class="event-layout__item media-frame media-frame--video">
        <iframe src="https://www.youtube-nocookie.com/embed/Dl7-TvakTZk" title="Il-Kap tal-Partit Nazzjonalista f’laqgħa ta’ kortesija mal-Għaqda Veterani tal-AFM" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
    <div class="event-layout event-layout--columns-3" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/8b3a298de56de779ed265aa9a9bb2267.jpg")} width="1080" height="720" alt="Photograph 1 of 2 from 4 October, 2024" loading="lazy" decoding="async">
      </figure>
      <div class="event-layout__item event-layout__item--empty" aria-hidden="true"></div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/84335d6ddab2f5701ddfeafec39ee2ee.jpg")} width="1080" height="720" alt="Photograph 2 of 2 from 4 October, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-september-11-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OiUrBf">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-september-11-2024">September 11, 2024</h3>
        <p>The George Cross Island Association had a courtesy meeting with Her Excellency The President Myriam Spiteri Debono. The Vice President of the MVA Mrs Maria Gatt, attended as part of the committee of the George Cross Island&nbsp;Association.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="II5mzb">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/00e5c48ac43ec0d6906853dff1d297bd.jpg")} width="1600" height="1066" alt="Photograph from September 11, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-the-importance-of-elderly-in-society-august-22-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-the-importance-of-elderly-in-society-august-22-2024"><strong>The importance of&nbsp; elderly in society - </strong><strong>August </strong><strong>22, 2024&nbsp;</strong></h3>
        <p>As part of the Presidency from The Alliance of Pensioners' Organisations, Mr Anthony Grech, Mr Aristide Galea and Mr Noel Mifsud paid a courtesy visit to E.T. the President Myriam Spiteri Debono. The Representatives from the Alliance discussed various initiatives they took to try to improve the general well-being of pensioners in their daily lives and the importance of the elderly in society. The&nbsp;work&nbsp;continues.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/ae42fb87580d595899b90c5d861fe9ac.jpg")} width="1080" height="771" alt="Photograph from The importance of elderly in society - August 22, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-august-17-2024" data-featured-photo="6">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-august-17-2024"><strong>August </strong><strong>17, 2024</strong></h3>
        <p>the 82nd anniversary of Operation Pedestal was Commemorated at All Hallows by the Tower church and the site of the Malta Memorial in London. Ms. Maria Gatt had the honour of participating in the service as a committee member of the GCIA (Malta Branch) and the Veterans Association (Malta) by reading the prayer and exhortation in Maltese and singing the&nbsp;Maltese&nbsp;anthem.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      
    </div>
    <EventGallery id="event-august-17-2024" gallery={galleries["event-august-17-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-operation-pedestal-tribute-august-13-2024" data-featured-photo="2">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-2" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-operation-pedestal-tribute-august-13-2024"><strong>Operation Pedestal Tribute&nbsp; - August 13, 2024</strong></h3>
        <p>The Veteran's Association was invited to participate in this year's Operation Pedestal tribute on 13 August 2024. Captain Ray Xuereb (retd) represented the Association by placing&nbsp;a&nbsp;wreath.</p>
      </div>
      
    </div>

    <EventGallery id="event-operation-pedestal-tribute-august-13-2024" gallery={galleries["event-operation-pedestal-tribute-august-13-2024"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-courtesy-visit-with-the-president-of-malta-july-9-2024" data-featured-photo="4">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-3" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-courtesy-visit-with-the-president-of-malta-july-9-2024"><strong>Courtesy visit with the President of Malta&nbsp; - July 9, 2024</strong></h3>
        <p>The Armed Forces Veterans Association Committee paid a courtesy visit to Her Excellency the President of Malta on Tuesday 09 July 2024.</p>
        <p>During this meeting, the members of the Association explained that the Malta Veterans Association was established in 2023 to give a voice to veterans and their families and to support them.</p>
      </div>

    </div>
    
    <EventGallery id="event-courtesy-visit-with-the-president-of-malta-july-9-2024" gallery={galleries["event-courtesy-visit-with-the-president-of-malta-july-9-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-lunch-with-the-royal-british-legion-june-19-2024" data-featured-photo="3">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-lunch-with-the-royal-british-legion-june-19-2024"><strong>Lunch with the Royal British Legion - June 19, 2024</strong></h3>
        <p>Today, June 19, 2024, the <a href="https://www.britishlegion.org.uk/" target="_blank" rel="noopener noreferrer">Royal British Legion</a> invited the Veterans Association for a celebratory lunch at the Vittoriosa Lawn Tennis Club (VLTC) in honour of the United Kingdom's Armed Forces Day. It was a wonderful occasion to strengthen our bonds and celebrate together.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="qWD73c">
      
    </div>
    <EventGallery id="event-lunch-with-the-royal-british-legion-june-19-2024" gallery={galleries["event-lunch-with-the-royal-british-legion-june-19-2024"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-veterans-lunch-may-28-2024" data-featured-photo="2">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-2" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-veterans-lunch-may-28-2024"><strong>Veterans' Lunch - May 28, 2024</strong></h3>
        <p>On May 28, 2024, our members once again chose to hold the monthly veterans' lunch at VLTC (Vittoriosa Lawn Tennis Club). Thanks to the exceptional staff, the event was well-attended and the food was truly marvelous, adding to the enjoyment of all who attended.&nbsp;</p>
        <p>It was also the committee's pleasure to invite the <a href="https://www.georgecrossisland.org.uk/" target="_blank" rel="noopener noreferrer">George Cross Island Association</a> and the <a href="https://www.britishlegion.org.uk/" target="_blank" rel="noopener noreferrer">Royal British Legion</a> to attend the lunch.</p>
      </div>
      
    </div>
    <div class="event-layout--content-only event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="qWD73c">

    </div>
    <EventGallery id="event-veterans-lunch-may-28-2024" gallery={galleries["event-veterans-lunch-may-28-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-veterans-lunch-event-april-19-2024" data-featured-photo="2">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-3" data-source-layout="wNfPc">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-veterans-lunch-event-april-19-2024"><strong>Veterans' Lunch Event - April 19, 2024</strong></h3>
        <p>On April 19, 2024, the Malta Veterans Association hosted a memorable lunch at VLTC (Vittoriosa Lawn Tennis Club).</p>
      </div>

    </div>
    <div class="event-layout--content-only event-layout event-layout--columns-2" data-source-layout="II5mzb">
      <div class="event-layout__item event-copy prose">
        <p>The event was well-received, with a lovely turnout of attendees. We extend our appreciation to the talented cooks and staff at VLTC, whose exceptional service and hospitality contributed to the success of the occasion.</p>
      </div>
      
    </div>
    
    <EventGallery id="event-veterans-lunch-event-april-19-2024" gallery={galleries["event-veterans-lunch-event-april-19-2024"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-afm-band-display-reception-april-17-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-afm-band-display-reception-april-17-2024"><strong>AFM Band Display/Reception - April 17, 2024</strong></h3>
        <p>Today, Wednesday, April 17, 2024, the AFM Band held a special display and reception at Luqa Barracks in honour of the members of the George Cross Island Association and the King's Own Malta Regiment. We extend our gratitude to Brigadier Clinton O'Neil for the kind invitation and for making this memorable event possible.</p>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/e35030ec45cdf9ef004262e42600abf1.png")} width="2048" height="938" alt="Photograph 1 of 2 from AFM Band Display/Reception - April 17, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/588a8726303d753ac9b1ef28f1146fda.png")} width="1080" height="721" alt="Photograph 2 of 2 from AFM Band Display/Reception - April 17, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-opening-of-the-office-april-13-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-opening-of-the-office-april-13-2024"><strong>Opening of the Office - April 13, 2024</strong></h3>
        <p>We would like to thank the <span class="text-accent">CAFM</span>, <span class="text-accent">CO</span>, and <span class="text-accent">A</span><span class="text-accent">dj 4 Reg AFM</span> for giving us an office within Luqa Barracks in order to be able to be more accessible to our veterans.</p>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/ae598ecf2ff4c23eee6bdfd592f8f162.jpg")} width="2048" height="1536" alt="Photograph 1 of 3 from Opening of the Office - April 13, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/b0daeef075f4623950bcc841414afcb3.jpg")} width="2048" height="1536" alt="Photograph 2 of 3 from Opening of the Office - April 13, 2024" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/88bf90bca743c1d14b6421439c096c99.png")} width="2048" height="1536" alt="Photograph 3 of 3 from Opening of the Office - April 13, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-pension-reform-talk-april-11-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-pension-reform-talk-april-11-2024"><strong>Pension Reform Talk - April 11, 2024</strong></h3>
        <p>A comprehensive talk on pensions was held at the Sergeants Mess, addressing active soldiers, veterans, and those transitioning from full-time to part-time roles within the army. The session provided valuable insights and information on pension plans and benefits tailored to each group.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/1fa54f686e5ceefa76d5a81e128120f3.png")} width="1600" height="1204" alt="Photograph from Pension Reform Talk - April 11, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-annual-general-meeting-march-15-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-annual-general-meeting-march-15-2024"><strong>Annual General Meeting -{' '}</strong><strong>March{' '}</strong><strong>15, 2024</strong></h3>
        <p>Friday, March 15, 2024, at 6:00 PM, we held our Annual General Meeting at the Other Ranks Canteen, Headquarters of the Armed Forces, Luqa Barracks.</p>
        <p>We thank all attendees and urge former colleagues to join the association. Special thanks to the Commander, the Deputy Commander, Adjutant of the 4th Regiment, and the staff.</p>
        <p>Despite hoping for a larger turnout, we emphasize the importance of this annual meeting for reviewing past achievements and future plans. We encourage all members to participate and support the committee's efforts.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/14a34e89336092650d0fe23998a734b3.png")} width="2048" height="1536" alt="Photograph 1 of 2 from Annual General Meeting - March 15, 2024" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/cc3cfe6f87a0a8a846ecf2ccc5ff454f.png")} width="2048" height="597" alt="Photograph 2 of 2 from Annual General Meeting - March 15, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-2nd-visit-to-the-maritime-base-march-6-2024" data-featured-photo="6">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-2nd-visit-to-the-maritime-base-march-6-2024"><strong>2nd Visit to the Maritime Base - March 6, 2024</strong></h3>
        <p>Our second visit to the maritime base was another resounding success. Veterans had the opportunity to tour the P71 and enjoyed a delightful lunch at the mess.&nbsp;</p>
        <p>We extend our gratitude to Lt. Col Russell Caruana for warmly welcoming us and facilitating a memorable experience for all involved.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      
    </div>
    <EventGallery id="event-2nd-visit-to-the-maritime-base-march-6-2024" gallery={galleries["event-2nd-visit-to-the-maritime-base-march-6-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry event-entry--carousel" aria-labelledby="event-lunch-with-pawlu-february-29-2024" data-featured-photo="4">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="qWD73c">
      
    </div>
    <div class="event-layout event-layout--columns-1" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-lunch-with-pawlu-february-29-2024">Lunch with Pawlu - February 29, 2024</h3>
        <p>On February 29, 2024, the Malta Veterans Association hosted a special lunch event with Pawlu at a charming restaurant in Bahrija. This gathering provided a unique opportunity for members to enjoy a delightful meal and engaging conversation in a picturesque setting.</p>
      </div>
    </div>
    <EventGallery id="event-lunch-with-pawlu-february-29-2024" gallery={galleries["event-lunch-with-pawlu-february-29-2024"]} />
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-first-visit-to-the-maritime-base-january-30-2024" data-featured-photo="1">
  <div class="content-container event-entry__content">
    <div class="event-layout--content-only event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-first-visit-to-the-maritime-base-january-30-2024"><strong>First Visit to the Maritime Base -{' '}</strong><strong>January&nbsp;{' '}</strong><strong>30, 2024</strong></h3>
        <p>During our first visit to the maritime base, there was overwhelming demand from veterans eager to see the latest addition to the maritime squadron, the P71.&nbsp;</p>
        <p>Under the gracious hosting of Lt. Col Russell Caruana, we were not only given the opportunity to tour the base but also enjoyed a specially arranged lunch.&nbsp;</p>
        <p>It was a memorable experience for all involved, highlighting the strong camaraderie within our association.</p>
      </div>
      
    </div>
    <div class="event-layout--content-only event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="wNfPc">

    </div>
    <EventGallery id="event-first-visit-to-the-maritime-base-january-30-2024" gallery={galleries["event-first-visit-to-the-maritime-base-january-30-2024"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-courtesy-call-to-cafm-january-16-2024">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OiUrBf">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-courtesy-call-to-cafm-january-16-2024">Courtesy Call to CAFM - January 16, 2024</h3>
        <p>On January 16, 2024, a courtesy call was made to the Commander of the Armed Forces of Malta, Brigadier Clinton O'Neil, and Deputy Commander Col. Edric Zahra. During the meeting, we exchanged ideas and opinions, and we expressed our gratitude for the support provided by CAFM. We especially appreciate the provision of an office at Luqa Barracks, which enhances our accessibility and operations for the benefit of all veterans.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-2 event-gallery-grid" data-source-layout="II5mzb">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/d4d8a2058f4418670b2316d789220a14.png")} width="1080" height="907" alt="Photograph 1 of 2 from Courtesy Call to CAFM - January 16, 2024" loading="lazy" decoding="async">
      </figure>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/0020d17e388ac3b32fb314f31cc49084.png")} width="1080" height="810" alt="Photograph 2 of 2 from Courtesy Call to CAFM - January 16, 2024" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry event-entry--carousel" aria-labelledby="event-christmas-drinks-event-december-16-2023" data-featured-photo="7">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="qWD73c">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-christmas-drinks-event-december-16-2023">Christmas Drinks Event - December 16, 2023</h3>
        <p>On Saturday, December 16, 2023, a festive Christmas drinks event was held at the Vittoriosa Lawn Tennis Club. The gathering was open to all members of the Malta Veterans Association. We were honored to have the Commander and the Deputy Commander of the Armed Forces of Malta in attendance, as they graciously accepted our invitation. It was a wonderful opportunity for members to connect and celebrate the holiday season together.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="qWD73c">
      
    </div>
    <EventGallery id="event-christmas-drinks-event-december-16-2023" gallery={galleries["event-christmas-drinks-event-december-16-2023"]} />
  </div>
</article>

<article class="content-section content-section--muted event-entry" aria-labelledby="event-first-committee-meeting-of-malta-veterans-association-october-14-2023">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-1" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-first-committee-meeting-of-malta-veterans-association-october-14-2023">First Committee Meeting of Malta Veterans Association - October 14, 2023</h3>
        <p>The inaugural committee meeting of the Malta Veterans Association took place on October 14, 2023, at the TCK Tennis Club in Corradino. During this pivotal meeting, various themes and objectives were discussed to establish the association formally. Additionally, roles were assigned to each member, laying the groundwork for the organization's future activities and initiatives.</p>
      </div>
    </div>
    <div class="event-layout event-layout--columns-1 event-gallery-grid" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/635cb41e4eaba77b298ce62aa1aafcae.jpg")} width="2000" height="900" alt="Photograph from First Committee Meeting of Malta Veterans Association - October 14, 2023" loading="lazy" decoding="async">
      </figure>
    </div>
  </div>
</article>

<article class="content-section content-section--dark event-entry" aria-labelledby="event-after-the-1st-general-meeting-held-on-october-6-2023-at-luqa-barracks">
  <div class="content-container event-entry__content">
    <div class="event-layout event-layout--columns-2" data-source-layout="OwsYgb">
      <div class="event-layout__item event-copy prose">
        <h3 class="event-entry__title" id="event-after-the-1st-general-meeting-held-on-october-6-2023-at-luqa-barracks">After the 1st General meeting held on October 6, 2023 at Luqa Barracks</h3>
      </div>
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/8fe521945171747230c657bcb5d84162.jpg")} width="1920" height="1080" alt="Photograph 1 of 2 from After the 1st General meeting held on October 6, 2023 at Luqa Barracks" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="event-layout event-layout--columns-2" data-source-layout="wNfPc">
      <figure class="event-layout__item event-photo">
        <img class="event-photo__image" src={asset("assets/images/events/d26afffdf347928b68388f90d1c466f9.jpg")} width="1920" height="1080" alt="Photograph 2 of 2 from After the 1st General meeting held on October 6, 2023 at Luqa Barracks" loading="lazy" decoding="async">
      </figure>
      <div class="event-layout__item event-copy prose">
        <p class="event-copy--justify">13 people from a gathering of around 50 members came forward to form the Committee.</p>
      </div>
    </div>
  </div>
</article>
