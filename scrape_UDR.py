#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Apr  2 10:59:22 2017

@author: steven
"""
import re
import pdb
import json
from lxml import html
import pandas as pd

page = html.parse("http://www.math.wm.edu/~leemis/chart/UDR/UDR.html")
list_distributions =  page.xpath('//*[@id="distributions"]/ul')
discrete, continuous = [i.xpath('./li/a') for i in list_distributions]
nodes, edges = {}, {}
def collect_nodes(distributions_group, is_discrete):
    for distribution in distributions_group:
        href = distribution.get('href')
        nodes[href] = {
            "name": distribution.text.strip(),
            "is_discrete": is_discrete
        }

collect_nodes(discrete, True)
collect_nodes(continuous, False)

distributions = page.xpath('//area[@shape="rect"]')
relationships = page.xpath('//area[@shape="polygon"]')
for dist in distributions:
    href = dist.get("href")
    if not href:
        # these are only the properties, ignore them
        continue
    if href in nodes:
        nodes[href]["id"] = dist.get("title")
    else:
        nodes[href] = {
            "href": "http://www.math.wm.edu/~leemis/chart/UDR/" + href,
            "id": dist.get("title"),
            "name": "unknown",
            "is_discrete":"unknown"
        }

for rel in relationships:
    href = rel.get("href")
    if not href:
        raise ValueError('relationship missing link to proof')
    edge = edges[href] = {
        "name": rel.get("title"),
        "href": "http://www.math.wm.edu/~leemis/chart/UDR/" + href
    }
    name = edge["name"]
    if re.match(r"(IDB|TSP)", edge.get("name")):
        # this is an exception to the DistsrcDisttarrget edge-naming pattern
        match = re.match(r"(IDB|TSP)([A-Z][a-z]{0,})(B|T){0,}", name)
    else:
        match = re.search(r"([A-Z][a-z]{0,})([A-Z][a-z]{0,})(B|T){0,}", name)
    edge["source"], edge["target"], edge["flag"] = match.groups()

# transform to JSON formatted for d3 graph display and save
d3_json = {
    "nodes":[i for i in nodes.values()],
    "links":[i for i in edges.values()]
}
with open("original_UDR_graph.json", "w") as json_file:
    json_file.write(json.dumps(d3_json))

# produce nodelist and edgelist CSVs
nodelist = pd.DataFrame.from_dict(nodes, orient="index")
nodelist.to_csv('original_UDR_graph_nodelist', index=False)
edgelist = pd.DataFrame.from_dict(edges, orient="index")
edgelist.to_csv('original_UDR_graph_edgelist', index=False)
