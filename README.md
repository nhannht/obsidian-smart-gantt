>[!tip]
> Check https://obsidian-smart-gantt.pages.dev for a full document

<h1
    align="center"
>Obsidian Smart Gantt</h1>

---

<div align="center">
<sub>Intelligently generate Gantt Chart for your task across your vault</sub>

</div>

---

<ul>

- Keep track of all your tasks across your vault.
- Generate a Gantt chart based on them
- Quick jump to your task location. 

</ul>

---

##### Simplest use cases

---

###### Using the right sidebar.

- Open your sidebar and magic will happen

![](./assets/README-1712821565619.png)

###### Gantt code block.

---

<div><sub>Simply create a Gantt code block somewhere in your file </sub> </div>

````markdown
 ```gantt

 ```
````

![](./assets/README-1712821625314.png)

---

##### Limitation



> [!tip]
> 
> Only track a valid task (line with checkbox) which have part of string that can interpret as time/time range
> 
> Smart Gantt is not perfect for natural language processing:
> - Cannot parse text with only a year like "2024", so please write your sentence a bit clearly
> 
> - Time (hours, minutes) of day must stay after date. Example Sat Aug 17 2024 9 AM or Sat Aug 17 2013 18:40:39 GMT+0900 or 2014-11-30T08:15:30-05:30. But 9 AM April/11/2024 will be parsed as 2 different points of time.
> 
> - Relative time like - today, tomorrow, yesterday, last friday, 5 hours from now - will work in theory, but it is not useful at all. Because every time you refresh the plot will parse from your current point of time
