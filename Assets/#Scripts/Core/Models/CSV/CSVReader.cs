/*
    CSVReader by Dock. (24/8/11)
    http://starfruitgames.com

    usage:
    CSVReader.SplitCsvGrid(textString)

    returns a 2D string array.

    Drag onto a gameobject for a demo of CSV parsing.
*/

using System.Linq;
using UnityEngine;

namespace Models.CSV
{
    public class CSVReader
    {
        public TextAsset csvFile;

        public void Start()
        {
            var grid = SplitCsvGrid(csvFile.text);
            Debug.Log("size = " + (1 + grid.GetUpperBound(0)) + "," + (1 + grid.GetUpperBound(1)));
            DebugOutputGrid(grid);
        }

        // outputs the content of a 2D array, useful for checking the importer
        public static void DebugOutputGrid(string[,] grid)
        {
            var textOutput = "";

            for (var y = 0; y < grid.GetUpperBound(1); y++) {
                for (var x = 0; x < grid.GetUpperBound(0); x++) {
                    textOutput += grid[x, y];
                    textOutput += "|";
                }
                textOutput += "\n";
            }
            Debug.Log(textOutput);
        }

        // splits a CSV file into a 2D string array
        public static string[,] SplitCsvGrid(string csvText)
        {
            var lines = csvText.Split("\n"[0]);

            // finds the max width of row
            var width = 0;

            for (var i = 0; i < lines.Length; i++) {
                var row = SplitCsvLine(lines[i]);
                width = Mathf.Max(width, row.Length);
            }

            // creates new 2D string grid to output to
            var outputGrid = new string[width + 1, lines.Length + 1];

            for (var y = 0; y < lines.Length; y++) {
                var row = SplitCsvLine(lines[y]);

                for (var x = 0; x < row.Length; x++) {
                    outputGrid[x, y] = row[x];

                    // This line was to replace "" with " in my output. 
                    // Include or edit it as you wish.
                    outputGrid[x, y] = outputGrid[x, y].Replace("\"\"", "\"");
                }
            }
            return outputGrid;
        }

        // splits a CSV row 
        public static string[] SplitCsvLine(string line) =>
            (from System.Text.RegularExpressions.Match m in
                    System.Text.RegularExpressions.Regex.Matches(line,
                        @"(((?<x>(?=[,\r\n]+))|""(?<x>([^""]|"""")+)""|(?<x>[^,\r\n]+)),?)",
                        System.Text.RegularExpressions.RegexOptions.ExplicitCapture)
                select m.Groups[1].Value).ToArray();
    }
}
