const settings = {
  type: 'list',
  container: '.sc',
  crawl: {
    successCriterion: {
      elem: 'h4:first-of-type',
	  process: [['replace','ยง','']]
    },
    comfLevels: {
        elem: '.conformance-level'
    },
    briefDesc: {
        elem: 'p:nth-of-type(2)'
    },
	
	url: {
		elem: '.doclinks a:first-of-type',
        get:  'href'
	}
  }
};

module.exports = settings;
