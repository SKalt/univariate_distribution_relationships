"""
The text below is taken from http://www.math.wm.edu/~leemis/chart/UDR/about.html.
This script is meant to implement corrections to the network scraped from
http://www.math.wm.edu/~leemis/chart/UDR/UDR.html
"""
import json
import pandas as pd
import pdb
if __name__ == '__main__':
    with open('./data/original_UDR_graph.json', 'r') as json_file:
        graph = json.loads(json_file.read())

    # Are there errors on the chart?

    # Yes. The chart is basically identical to that which was published in The
    # American Statistician. In writing the proofs for some of the properties and
    # relationships, we have uncovered errors. In addition, we were unable to
    # complete some of the proofs. They are listed by categories below.

    # Distributions that don't belong on the chart:
    # The Gamma-normal distribution is a bivariate distribution
    for node in graph["nodes"]:
        if node["id"] == 'Gammanormal':
            print('Removing: ' + str(node))
            graph["nodes"].remove(node)
        else:
            pass
    # remove all edges associated with the node:
    for link in graph["links"]:
        if link["source"] == "Gammanormal" or link["target"] == "Gammanormal":
            graph["links"].remove(link)
            print('Removing: ' + str(link))
        else:
            pass

    # Properties
    # Incorrect properties: 
    # Standard Cauchy (S)
    # Standard Wald (S)
    # von Mises (S)
    
    # Unproven properties:
    # Cauchy (C)
    # Cauchy (I)
    # InverseGaussian (L)
    # Lognormal (P)
    # Potential missing properties:
    # Inverse Gaussian (S)
    # Uniform (S)

    # Relationships
    # Incorrect relationships: [N/A]
    def remove_relationship(source, target, _graph=graph):
        target_link = {}
        for link in graph["links"]:
            if link["source"] == source and link["target"] == target:
                print("Removing: " + str(link))
                target_link = link
                _graph["links"].remove(link)
                break
            else:
                pass
        if not target_link:
            raise ValueError('link not found')

    # Unproven relationships:
    def tag_relationship_unproven(source, target, _graph=graph):
        target_link = {}
        for link in graph["links"]:
            #pdb.set_breakpoint()
            if link["source"] == source and link["target"] == target:
                print("tagging unproven: " + str(link))
                target_link = link
                link["proven"] = False
                break
            else:
                pass
        if not target_link:
            raise ValueError('link not found')

    # Beta-binomial ---> Negative hypergeometric
    tag_relationship_unproven('Betabinomial', 'Negativehypergeometric')
    # Doubly noncentral F ---> Noncentral F
    tag_relationship_unproven('Doublynoncentralf', 'Noncentralf')
    # Generalized gamma ---> Lognormal
    tag_relationship_unproven('Generalizedgamma', 'Lognormal')
    # Hypoexponential ---> Erlang
    tag_relationship_unproven('Hypoexponential', 'Erlang')
    # Inverse Gaussian ---> Chi-square
    tag_relationship_unproven('Inversegaussian', 'Chisquare')
    # Inverse Gaussian ---> Standard normal
    tag_relationship_unproven('Inversegaussian', 'Standardnormal')
    # Normal ---> Noncentral chi-square
    tag_relationship_unproven('Normal', 'Noncentralchisquare')
    # Pascal ---> Normal [should be mu = n (1 - p) / p on the chart]
    "parameters are currently not stored in the json graph we're editing"
    # Pascal ---> Poisson
    tag_relationship_unproven('Pascal', 'Poisson')
    # Potential missing relationships:
    # Wrong parameter values:
    # Standard Uniform ---> Logistic-Exponential
    "parameters are currently not stored in the json graph we're editing"
    # Plots on the distribution page would be helpful: Polya, Power series
    "Also not stored in the json graph we're editing"

    #check & correct link source/target IDs
    ids = set([node['id'] for node in graph['nodes']])
    for link in graph['links']:
        if link['source'] not in ids:
            print(link, 'source not in ids')
        if link['target'] not in ids:
            print(link, 'target not in ids')
    faulty = [link for link in graph['links'] if link['target'] not in ids][0]
    faulty['target'] = 'Noncentralt'
    faulty['name'] = 'DoublynoncentraltNoncentralt'
            
    # save the corrected data
    with open('./data/corrected_UDR_graph.json', 'w') as target_json_file:
        target_json_file.write(json.dumps(graph))

    nodelist = pd.DataFrame(graph["nodes"])
    nodelist.to_csv('./data/corrected_UDR_graph_nodelist.csv', index=False)
    edgelist = pd.DataFrame(graph["links"])
    edgelist.to_csv('./data/corrected_UDR_graph_edgelist.csv', index=False)
