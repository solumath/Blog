# Hobby blog

My setup for a hobby blog using [Hugo](https://gohugo.io/) and [Blowfish theme](https://github.com/nunocoracao/blowfish).

## Updating

[Update blowfish theme](https://blowfish.page/docs/installation/#update-using-git)

```bash
git submodule update --remote --merge
```

Update Hugo version in workflow file [`.github/workflows/hugo.yaml`](.github/workflows/hugo.yaml#L37)

Find [hugo **extended**](https://github.com/gohugoio/hugo/releases) release that blowfish supports.
Download and replace the binary in your system.

```bash
tar -xzvf hugo_extended_*.tar.gz -C ~/bin hugo 
```
