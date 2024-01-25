using System.Collections.Generic;
using UnityEditor.IMGUI.Controls;

class SimpleTreeView : TreeView
{
    public SimpleTreeView(TreeViewState treeViewState)
            : base(treeViewState)
    {
        Reload();
    }



    protected override TreeViewItem BuildRoot ()
    {
        // 每次调用 Reload 时都调用 BuildRoot，从而确保使用数据
        // 创建 TreeViewItem。此处，我们将创建固定的一组项。在真实示例中，
        // 应将数据模型传入 TreeView 以及从模型创建的项。

        // 此部分说明 ID 应该是唯一的。根项的深度
        // 必须为 -1，其余项的深度在此基础上递增。
        var root = new TreeViewItem {id = 0, depth = -1, displayName ="Root"};
        var allItems = new List<TreeViewItem>
        {
            new TreeViewItem {id = 1, depth = 0, displayName = "Animals"},
            new TreeViewItem {id = 2, depth = 1, displayName = "Mammals"},
            new TreeViewItem {id = 3, depth = 2, displayName = "Tiger"},
            new TreeViewItem {id = 4, depth = 2, displayName = "Elephant"},
            new TreeViewItem {id = 5, depth = 2, displayName = "Okapi"},
            new TreeViewItem {id = 6, depth = 2, displayName = "Armadillo"},
            new TreeViewItem {id = 7, depth = 1, displayName = "Reptiles"},
            new TreeViewItem {id = 8, depth = 2, displayName = "Crocodile"},
            new TreeViewItem {id = 9, depth = 2, displayName = "Lizard"},
        };

        // 用于初始化所有项的 TreeViewItem.children 和 .parent 的实用方法。
        SetupParentsAndChildrenFromDepths (root, allItems);

        //返回树的根
        return root;
    }
}
