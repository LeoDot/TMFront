<template>
  <div :class="css.wrap">
    <div
      :class="current === 'tokymaker' ? css.active : ''"
      @click="select('tokymaker')"
    >
      TokyMaker
    </div>
    <div :class="current === 'ar' ? css.active : ''" @click="select('ar')">
      AR
    </div>
  </div>
</template>

<script>
export default {
  name: "SwitchBtn",
  data() {
    return {
      current: "tokymaker"
    };
  },
  methods: {
    select(target) {
      this.current = target;
      window.switchTarget(target);
    }
  }
};
</script>

<style lang="scss" module="css">
$height: 22px;
.wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: $height + 2;
  border-radius: ($height + 2)/2;
  background: #ddf;
  /*padding:1px;*/
  font-size: 14px;

  div {
    /*min-width: 80px;*/
    display: flex;
    justify-content: center;
    align-items: center;
    height: $height;
    flex-grow: 1;
    border-radius: $height/2;
    margin: 0 1px;
    cursor: pointer;
    font-weight: bold;
    color: #454545;
    padding: 10px;

    &.active {
      color: #fff;
      background: #3c75e4;
    }
  }
}
</style>
