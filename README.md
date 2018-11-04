## Waterfall chart d3 v4

Based on the previous work of Chuck Lam, that you can find over there : [Block using d3 v3](http://bl.ocks.org/chucklam/f3c7b3e3709a0afd5d57)

A recreation of the waterfall chart example in Wikipedia. This type of chart is popularized by McKinsey & Company in explaining the cumulative impact of various factors on some quantitative value.

## New features

During my work at MYCS GmbH, I had to implement a reporting tool using, inter alia, waterfall charts. After agreement with MYCS GmbH, I've decided to share a tempalte of the javascript code used to generate those charts.

I added an extra function called *insertStackedRemainderBefore(**barName**, **newBarName**)*, that inserts in the chart a stacked remainder called **newBarName** before the bar **barName**. This is a functionality often used in waterfall charts.

## Suggestions

If you have any suggestions of possible improvements, feel free to reach out to me.