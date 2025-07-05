# Wikipedia API

Best to use wikidata query to fetch geolinked historical data


```wikidata query
#defaultView:Map
SELECT ?event ?eventLabel ?eventDescription ?date ?coords ?eventTypeLabel ?image WHERE {

  # Configuration is the same...
  BIND("Point(4.895168 52.370216)"^^geo:wktLiteral AS ?center_point)
  BIND(10 AS ?radius)
  BIND("1940-01-01T00:00:00Z"^^xsd:dateTime AS ?start_date)
  BIND("1945-12-31T23:59:59Z"^^xsd:dateTime AS ?end_date)

  # Find items with coordinates DIRECTLY within the search area
  SERVICE wikibase:around {
    ?event wdt:P625 ?coords .
    bd:serviceParam wikibase:center ?center_point .
    bd:serviceParam wikibase:radius ?radius .
  }
  
  # And immediately filter them by type and date
  VALUES ?eventType {
    wd:Q178561 wd:Q3839081 wd:Q16510064 wd:Q40231 wd:Q189913 
    wd:Q1323136 wd:Q387526 wd:Q19830275 wd:Q1190554
  }
  ?event wdt:P31 ?eventType .
  ?event wdt:P585|wdt:P580 ?date .
  FILTER(?date >= ?start_date && ?date <= ?end_date)
  
  # Get labels and optional info
  OPTIONAL { ?event wdt:P18 ?image . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
}
ORDER BY ?date

```
