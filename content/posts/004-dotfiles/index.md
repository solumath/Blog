---
title: Manage Dotfiles with Git
published: 2025-09-05T23:48:04+02:00
modified: 2025-09-06T20:57:50+02:00
draft: false
description: How to manage Dotfiles with Git.
cover: "[[featured.jpg]]"
tags:
  - git
  - tutorial
  - bash
  - zsh
  - ohmyzsh
  - dotfiles
---
If you’d rather skip the details, you can check out my dotfiles directly.

{{< github repo="solumath/.dotfiles" showThumbnail=false >}}

## The Problem

If you’ve ever had to set up a new machine from scratch, you probably know the pain of recreating your development environment. Especially when you are reinstalling systems a lot. Those quality of life tweaks like autocompletion, aliases, suggestions for commands, ... they are missing and it's like missing your right hand.

I needed a way to:

- Keep all my dotfiles versioned
- Sync them across multiple machines (especially [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) configs)
- Use [Git](https://git-scm.com/) (since I already know it well)
- Avoid third-party dotfile managers I’d have to learn and forget the commands every so often

For long, I kept putting off setting up a proper dotfiles configuration. But it was only avoiding the inevitable. So here we are reading this post. I must have come up with something smart right? RIGHT?!

## Exploring Existing Solutions

My first intuition was to look at existing tools see if any of them fit my needs:
-  [yadm](https://github.com/yadm-dev/yadm) - Essentially a wrapper around Git, built specifically for dotfiles. It simplifies common tasks and even has encryption support for sensitive files
- [stow](https://www.gnu.org/software/stow/) - Simple symlink manager. You keep your dotfiles organized in a dedicated folder structure, and Stow creates symlinks into your home directory
- [chezmoi](https://github.com/twpayne/chezmoi) - A more full-featured manager. Handles symlinks and multiple machine setups but also supports templating. That means you can maintain one config file that adapts based on the machine you’re deploying to

All three of these tools are powerful, stable, and widely used, which is reassuring. But here’s the thing. While they solve the problem at hand, they also add an extra layer I’d have to learn and maintain.

And honestly? I didn’t want another abstraction between me and my configs. If something breaks in my shell, the last thing I want is to debug _another tool_ that sits between me and my dotfiles.

So I kept digging, looking for the simplest solution — one that relied only on [**Git**](https://git-scm.com/).

## Bare Git Repository

While searching for options, I stumbled upon [Atlassian’s tutorial](https://www.atlassian.com/git/tutorials/dotfiles) on managing dotfiles with bare Git repository.
This caught my attention. Git is the core of every developer and I know many of its commands by heart. This could be it.

So I gave it a shot:
```bash
git init --bare $HOME/.cfg
# Create alias config to manage the dotfiles
# Work-tree set to $HOME enables us to track every file in that path
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
# Show only tracked files, necessary or whole $HOME would show up on `git status`
config config --local status.showUntrackedFiles no
```

And now I could start adding files directly from my home directory:
```bash
config add .zshrc
config commit -m "Add zshrc"
config push
```

I was almost ready to call it a winner. **But there's a catch.**

All the tracked files have to live in your **home** directory. That works for some files but what about dotfiles that are in subdirectories?

That was too limiting for my set up, since I like keeping certain configs neatly organized in subfolders.

## My Dotfile Manager

After testing existing tools and the bare repo method, I decided to roll my own solution. It’s nothing fancy, just **Git plus a few symlinks**, but it gives me exactly the control I want without extra abstraction.

### 1. Create a Central Folder for Dotfiles

I keep everything in one place under `~/.dotfiles` and make it a Git repo:
```bash
mkdir ~/.dotfiles
git init ~/.dotfiles
```

### 2. Move Dotfiles into Structured Subfolders

For example, I keep Zsh-related files under a `zsh` subdirectory:
```bash
mkdir ~/.dotfiles/zsh
mv ~/.gitconfig ~/.dotfiles/
mv ~/.zshrc ~/.p10k.zsh ~/.dotfiles/zsh/
```

### 3. Handle Oh My Zsh and Plugins

[Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) itself is a Git repo, and so are most of its plugins. To avoid fighting that, I just move the `custom` folder into my dotfiles repo:
```bash
mv ~/.oh-my-zsh/custom ~/.dotfiles/zsh
```

Then, I update `.zshrc` so Oh My Zsh looks in the right place:
```bash
# Must be placed before sourcing oh-my-zsh
ZSH_CUSTOM="${HOME}/.dotfiles/zsh/custom"    
```

For plugins and themes, I add them as Git submodules. For example:
```bash
git submodule add git@github.com:marlonrichert/zsh-autocomplete.git zsh/custom/plugins/zsh-autocomplete
git submodule update --init --recursive
```

That way, I can pull them down consistently on any new machine.

### 4. Symlink Files back into place

Now that the _source of truth_ is `~/.dotfiles`, symlink the actual config files back where apps expect them.
```bash
ln -sf $(realpath ~/.dotfiles/.gitconfig) ~/.gitconfig
ln -sf $(realpath ~/.dotfiles/zsh/.zshrc) ~/.zshrc
ln -sf $(realpath ~/.dotfiles/zsh/.p10k.zsh) ~/.p10k.zsh
```

### 5. Write an Install Script

To set up a new machine quickly, I wrote a simple `install.sh`:

```bash
#!/bin/bash
set -e
set -u

if [ -d ~/.dotfiles ]; then
    read -p "The ~/.dotfiles directory already exists. Do you want to replace it? (y/n) " choice
    case "$choice" in
        y|Y ) rm -rf ~/.dotfiles ;;
        n|N ) exit 1 ;;
        * ) echo "Invalid choice. Exiting." ; exit 1 ;;
    esac
fi

git clone https://github.com/solumath/.dotfiles.git ~/.dotfiles

ln -sf $(realpath ~/.dotfiles/.gitconfig) ~/.gitconfig
ln -sf $(realpath ~/.dotfiles/zsh/.zshrc) ~/.zshrc
ln -sf $(realpath ~/.dotfiles/zsh/.p10k.zsh) ~/.p10k.zsh

# Initialize submodules
cd ~/.dotfiles
git submodule update --init --recursive
```

{{< alert icon="fire" >}}
[GitHub](https://github.com) exposes your public SSH keys through its [API](https://docs.github.com/en/rest/users/keys?apiVersion=2022-11-28).

You can fetch them onto any machine with a single command. Useful if you also want to setup SSH access.

`curl https://github.com/solumath.keys | tee -a ~/.ssh/authorized_keys`
{{< /alert >}}

### 6. Commit

Commit your changes:
```bash
git add .
git commit -m "Init dotfiles"
```

Add your GitHub repo as remote and push:
```bash
# Add GitHub repo as remote
git remote add origin git@github.com:solumath/.dotfiles.git

# Push initial commit to main branch
git branch -M main
git push -u origin main
```

Now I can install everything with one command:
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/solumath/.dotfiles/main/install.sh)"
```

## Reflection

At the end of the day, yes, I reinvented the wheel (again). But honestly, that’s the beauty of it. I know exactly how every piece fits together, and it all runs on one tool I already trust, **Git**.

Sure, there are limitations. It doesn’t have encryption out of the box, it doesn’t do fancy templating, and it requires a few symlinks here and there. But if your goal is **simplicity and full control**, this approach nails it (at least for me).

If you’ve been putting off organizing your dotfiles, I’d encourage you to try this (or one of the other tools I mentioned) — future you will thank you when setting up the next machine.

# References

- <https://git-scm.com/>
- <https://github.com/ohmyzsh/ohmyzsh>
- <https://www.atlassian.com/git/tutorials/dotfiles>
- <https://github.com/twpayne/chezmoi>
- <https://www.gnu.org/software/stow/>
- <https://github.com/yadm-dev/yadm>
- <https://github.com/marlonrichert/zsh-autocomplete>
- <https://docs.github.com/en/rest/users/keys?apiVersion=2022-11-28>
